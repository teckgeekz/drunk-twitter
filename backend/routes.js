const { ObjectId } = require('mongodb');

async function routes(fastify, options) {
  const db = fastify.db;
  const redis = fastify.redis;

  // ─── Helper: Generate a Drunk Anonymous Name ───
  function generateDrunkName() {
    const adjectives = [
      'Tipsy', 'Baba', 'Wasted', 'Blurred', 'Slurred',
      'Drunken', 'Jolly', 'Dizzy', 'Loopy', 'Wobbly', 'Fanny',
      'Bhang', 'Pickled', 'Toasty', 'Merry', 'Groggy', 'Sutta', 'Ratri', 'Kaluwa'
    ];
    const animals = [
      'Panda', 'Penguin', 'Koala', 'Chuppa', 'Raccoon',
      'Squirrel', 'Hedgehog', 'Otter', 'Capybara', 'RedPanda', 'Botal',
      'Badger', 'Lota', 'Hippo', 'Beaver', 'T-Rex', 'Lohar', 'Singh', 'Singham',
    ];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const anim = animals[Math.floor(Math.random() * animals.length)];
    return `${adj} ${anim}`;
  }

  // ─── Helper: Get or Create User Profile ───
  async function getOrCreateProfile(userId, name, email) {
    let profile = await db.collection('users').findOne({ userId });
    if (!profile) {
      const isAnonymous = !name && !email;
      const baseName = name || email?.split('@')[0] || generateDrunkName();
      const handle = baseName.toLowerCase().replace(/[^a-z0-9_ ]/g, '').replace(/\s+/g, '') || `user${Date.now()}`;

      // Ensure handle uniqueness by appending random digits if needed
      let finalHandle = handle;
      let attempts = 0;
      while (attempts < 5) {
        try {
          const result = await db.collection('users').insertOne({
            userId,
            displayName: baseName,
            handle: finalHandle,
            handleEdited: false,
            createdAt: new Date()
          });
          profile = { userId, displayName: baseName, handle: finalHandle, handleEdited: false, _id: result.insertedId };
          break;
        } catch (err) {
          if (err.code === 11000) {
            // Duplicate handle, append random suffix
            finalHandle = `${handle}${Math.floor(Math.random() * 9000) + 1000}`;
            attempts++;
          } else {
            throw err;
          }
        }
      }
    }
    return profile;
  }

  // ─── Initialize Cache on Startup ───
  fastify.addHook('onReady', async function () {
    const feedLen = await redis.lLen('feed:global');
    if (feedLen === 0) {
      const lockAcquired = await redis.set('feed:seed:lock', '1', { NX: true, EX: 30 });
      if (!lockAcquired) return;

      const rechecked = await redis.lLen('feed:global');
      if (rechecked > 0) {
        await redis.del('feed:seed:lock');
        return;
      }

      fastify.log.info('Redis feed empty. Loading from MongoDB...');
      const posts = await db.collection('posts')
        .find()
        .sort({ createdAt: -1 })
        .limit(1000)
        .toArray();

      if (posts.length > 0) {
        const pipeline = redis.multi();
        for (let i = posts.length - 1; i >= 0; i--) {
          const p = posts[i];
          const postStr = JSON.stringify({
            id: p._id.toString(),
            userId: p.userId,
            authorName: p.authorName || 'Anonymous',
            authorHandle: p.authorHandle || null,
            content: p.content,
            createdAt: p.createdAt.toISOString()
          });
          pipeline.lPush('feed:global', postStr);
        }
        pipeline.lTrim('feed:global', 0, 999);
        await pipeline.exec();
        fastify.log.info(`Loaded ${posts.length} posts into Redis`);
      }
      await redis.del('feed:seed:lock');
    }
  });

  // ─── GET /api/health ───
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', db: 'connected', redis: 'connected' };
  });

  // ─── GET /api/me ───
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    return { userId: request.user.userId, isSuperAdmin: request.user.isSuperAdmin };
  });

  // ─── GET /api/profile ───
  fastify.get('/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const profile = await getOrCreateProfile(
      request.user.userId,
      request.user.name,
      request.user.email
    );
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      handle: profile.handle,
      handleEdited: profile.handleEdited
    };
  });

  // ─── PUT /api/profile ───
  fastify.put('/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { displayName, handle } = request.body || {};
    const userId = request.user.userId;

    const profile = await db.collection('users').findOne({ userId });
    if (!profile) {
      return reply.code(404).send({ error: true, message: 'Profile not found' });
    }

    // Validate handle
    if (!handle || typeof handle !== 'string') {
      return reply.code(400).send({ error: true, message: 'Handle is required' });
    }
    const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanHandle.length < 3 || cleanHandle.length > 30) {
      return reply.code(400).send({ error: true, message: 'Handle must be 3–30 characters (letters, numbers, underscores)' });
    }

    // Validate displayName
    if (!displayName || typeof displayName !== 'string') {
      return reply.code(400).send({ error: true, message: 'Display name is required' });
    }
    const cleanName = displayName.trim();
    if (cleanName.length < 1 || cleanName.length > 50) {
      return reply.code(400).send({ error: true, message: 'Display name must be 1–50 characters' });
    }

    // Check handle availability (if changed)
    if (cleanHandle !== profile.handle) {
      const existing = await db.collection('users').findOne({ handle: cleanHandle });
      if (existing) {
        return reply.code(409).send({ error: true, message: 'This handle is already taken' });
      }
    }

    try {
      await db.collection('users').updateOne(
        { userId },
        { $set: { displayName: cleanName, handle: cleanHandle, handleEdited: true } }
      );

      return {
        userId,
        displayName: cleanName,
        handle: cleanHandle,
        handleEdited: true
      };
    } catch (err) {
      if (err.code === 11000) {
        return reply.code(409).send({ error: true, message: 'This handle is already taken' });
      }
      throw err;
    }
  });

  // ─── GET /api/handle/check ───
  fastify.get('/handle/check', async (request, reply) => {
    const { handle } = request.query;
    if (!handle) {
      return reply.code(400).send({ error: true, message: 'Handle query param is required' });
    }
    const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const existing = await db.collection('users').findOne({ handle: cleanHandle });
    return { available: !existing, handle: cleanHandle };
  });

  // ─── POST /api/posts ───
  fastify.post('/posts', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { content, replyToId, replyToHandle } = request.body || {};
    if (!content || typeof content !== 'string') {
      return reply.code(400).send({ error: true, message: 'Content is required and must be a string' });
    }

    const sanitizedContent = content.trim();
    if (sanitizedContent.length === 0 || sanitizedContent.length > 650) {
      return reply.code(400).send({ error: true, message: 'Content length must be between 1 and 650 characters' });
    }

    const userId = request.user.userId;
    const now = Date.now();

    // Rate Limiting
    const rateKey = `rate:user:${userId}`;
    const pipeline = redis.multi();
    pipeline.zAdd(rateKey, { score: now, value: `${now}-${Math.random()}` });
    pipeline.zRemRangeByScore(rateKey, '-inf', now - 60000);
    pipeline.zCard(rateKey);
    pipeline.expire(rateKey, 60);

    const results = await pipeline.exec();
    const count = results[2];

    if (count > 3) {
      return reply.code(429).send({
        error: true,
        message: "Whoa, slow down! You've had too much. Wait a minute before posting again 🛑🍺",
        code: "BREATHALYZER"
      });
    }

    // Get user profile for author info
    const profile = await getOrCreateProfile(userId, request.user.name, request.user.email);

    // Insert into MongoDB
    const postDoc = {
      userId,
      authorName: profile.displayName,
      authorHandle: profile.handle,
      content: sanitizedContent,
      createdAt: new Date(now),
      ...(replyToId && { replyToId }),
      ...(replyToHandle && { replyToHandle })
    };
    const insertResult = await db.collection('posts').insertOne(postDoc);

    const postResponse = {
      id: insertResult.insertedId.toString(),
      userId,
      authorName: profile.displayName,
      authorHandle: profile.handle,
      content: sanitizedContent,
      createdAt: postDoc.createdAt.toISOString(),
      ...(replyToId && { replyToId }),
      ...(replyToHandle && { replyToHandle })
    };

    // Extract @mentions and create notifications
    const mentionRegex = /@([a-z0-9_]{3,30})/gi;
    const mentions = [...sanitizedContent.matchAll(mentionRegex)].map(m => m[1].toLowerCase());
    const uniqueMentions = [...new Set(mentions)];

    if (uniqueMentions.length > 0) {
      // Find mentioned users (exclude self)
      const mentionedUsers = await db.collection('users')
        .find({ handle: { $in: uniqueMentions }, userId: { $ne: userId } })
        .toArray();

      if (mentionedUsers.length > 0) {
        const notifications = mentionedUsers.map(u => ({
          userId: u.userId,
          type: 'mention',
          fromUserId: userId,
          fromUserName: profile.displayName,
          fromUserHandle: profile.handle,
          postId: insertResult.insertedId.toString(),
          postContent: sanitizedContent.substring(0, 100),
          read: false,
          createdAt: new Date(now)
        }));
        await db.collection('notifications').insertMany(notifications);
      }
    }

    // Update Redis
    const cachePipeline = redis.multi();
    cachePipeline.lPush('feed:global', JSON.stringify(postResponse));
    cachePipeline.lTrim('feed:global', 0, 999);
    await cachePipeline.exec();

    return reply.code(201).send(postResponse);
  });

  // ─── GET /api/feed ───
  fastify.get('/feed', async (request, reply) => {
    const { cursor } = request.query;
    const limit = 30;

    try {
      let posts = [];

      // 1. Try fetching from Redis first
      const cachedPosts = await redis.lRange('feed:global', 0, 999);
      if (cachedPosts && cachedPosts.length > 0) {
        posts = cachedPosts.map(p => JSON.parse(p));

        // Filter by cursor if provided
        if (cursor) {
          const cursorTime = new Date(cursor).getTime();
          posts = posts.filter(p => new Date(p.createdAt).getTime() < cursorTime);
        }
      }

      // 2. If we don't have enough posts from Redis, or we are deep in the history, query MongoDB
      if (posts.length < limit) {
        const remainingLimit = limit - posts.length;
        const dbQuery = {};

        if (cursor) {
          dbQuery.createdAt = { $lt: new Date(cursor) };
        } else if (posts.length > 0) {
          // If we got some from Redis but not enough, get the rest from Mongo starting from the last Redis post
          dbQuery.createdAt = { $lt: new Date(posts[posts.length - 1].createdAt) };
        }

        const dbPosts = await db.collection('posts')
          .find(dbQuery)
          .sort({ createdAt: -1 })
          .limit(remainingLimit)
          .toArray();

        const formattedDbPosts = dbPosts.map(p => ({
          id: p._id.toString(),
          userId: p.userId,
          authorName: p.authorName || 'Anonymous',
          authorHandle: p.authorHandle || null,
          content: p.content,
          createdAt: p.createdAt.toISOString()
        }));

        posts = [...posts, ...formattedDbPosts];
      }

      const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt : null;
      return { posts, nextCursor };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: true, message: 'Internal Server Error' });
    }
  });

  // ─── GET /api/search ───
  fastify.get('/search', async (request, reply) => {
    const { q, cursor } = request.query;
    const limit = 30;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return { posts: [], nextCursor: null };
    }

    try {
      const searchRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const query = {
        $or: [
          { content: searchRegex },
          { authorName: searchRegex },
          { authorHandle: searchRegex }
        ]
      };

      if (cursor) {
        query.createdAt = { $lt: new Date(cursor) };
      }

      const dbPosts = await db.collection('posts')
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      const posts = dbPosts.map(p => ({
        id: p._id.toString(),
        userId: p.userId,
        authorName: p.authorName || 'Anonymous',
        authorHandle: p.authorHandle || null,
        content: p.content,
        createdAt: p.createdAt.toISOString()
      }));

      const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt : null;
      return { posts, nextCursor };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: true, message: 'Search failed' });
    }
  });

  // ─── GET /api/notifications ───
  fastify.get('/notifications', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.userId;
    try {
      const notifications = await db.collection('notifications')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      const unreadCount = await db.collection('notifications')
        .countDocuments({ userId, read: false });

      return {
        notifications: notifications.map(n => ({
          id: n._id.toString(),
          type: n.type,
          fromUserName: n.fromUserName,
          fromUserHandle: n.fromUserHandle,
          postId: n.postId,
          postContent: n.postContent,
          read: n.read,
          createdAt: n.createdAt.toISOString()
        })),
        unreadCount
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: true, message: 'Failed to fetch notifications' });
    }
  });

  // ─── POST /api/notifications/read ───
  fastify.post('/notifications/read', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.userId;
    await db.collection('notifications').updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    return { success: true };
  });

  // ─── GET /api/notifications/count ───
  fastify.get('/notifications/count', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.userId;
    const count = await db.collection('notifications').countDocuments({ userId, read: false });
    return { count };
  });

  // ─── DELETE /api/posts/nuke (Nuke My Night) ───
  fastify.delete('/posts/nuke', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.userId;
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    try {
      // Find posts to delete
      const postsToDelete = await db.collection('posts').find({
        userId,
        createdAt: { $gte: twelveHoursAgo }
      }).toArray();

      const postIds = postsToDelete.map(p => p._id.toString());

      if (postIds.length === 0) {
        return { success: true, message: 'No posts to nuke.', deletedCount: 0 };
      }

      // Delete from MongoDB
      await db.collection('posts').deleteMany({
        userId,
        createdAt: { $gte: twelveHoursAgo }
      });

      // Delete from notifications related to these posts
      await db.collection('notifications').deleteMany({
        postId: { $in: postIds }
      });

      // Remove from Redis feed
      const cachedPosts = await redis.lRange('feed:global', 0, -1);
      for (const cached of cachedPosts) {
        try {
          const parsed = JSON.parse(cached);
          if (postIds.includes(parsed.id)) {
            await redis.lRem('feed:global', 1, cached);
          }
        } catch { /* skip */ }
      }

      return { success: true, message: 'Your night has been nuked ☢️', deletedCount: postIds.length };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: true, message: 'Failed to nuke posts' });
    }
  });

  // ─── DELETE /api/posts/:id (Author or Super Admin) ───
  fastify.delete('/posts/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const postId = request.params.id;
    const isSuperAdmin = request.user.isSuperAdmin;
    const userId = request.user.userId;

    try {
      const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
      if (!post) {
        return reply.code(404).send({ error: true, message: 'Post not found' });
      }

      // Allow deletion if user is author OR super admin
      if (post.userId !== userId && !isSuperAdmin) {
        return reply.code(403).send({ error: true, message: 'Forbidden: You can only delete your own posts' });
      }
      // Delete from MongoDB
      const result = await db.collection('posts').deleteOne({ _id: new ObjectId(postId) });
      if (result.deletedCount === 0) {
        return reply.code(404).send({ error: true, message: 'Post not found' });
      }

      // Remove from Redis feed
      const cachedPosts = await redis.lRange('feed:global', 0, -1);
      for (const cached of cachedPosts) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.id === postId) {
            await redis.lRem('feed:global', 1, cached);
            break;
          }
        } catch { /* skip malformed */ }
      }

      return { success: true, message: 'Post deleted' };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: true, message: 'Failed to delete post' });
    }
  });
}

module.exports = routes;
