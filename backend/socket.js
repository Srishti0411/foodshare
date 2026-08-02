let ioInstance = null;

/**
 * Initializes socket.io on the given HTTP server.
 * Clients join a room named after their own user id ("user:<id>") so we can
 * push private notifications, and a coarse geo room ("geo:<lat>:<lng>" rounded
 * to ~1.1km grid cells) so nearby users can be notified of new listings
 * without the server tracking live socket positions in memory.
 */
function initSocket(server) {
  const { Server } = require('socket.io');

  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.on('connection', (socket) => {
    socket.on('identify', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on('subscribe:area', ({ lat, lng }) => {
      if (typeof lat !== 'number' || typeof lng !== 'number') return;
      // leave previous geo rooms
      [...socket.rooms].forEach((room) => {
        if (room.startsWith('geo:')) socket.leave(room);
      });
      const cell = geoCell(lat, lng);
      socket.join(cell);
    });

    socket.on('disconnect', () => {
      // socket.io cleans up room membership automatically
    });
  });

  return ioInstance;
}

// Rounds coordinates to a coarse grid so nearby users share a room.
function geoCell(lat, lng) {
  const precision = 1; // ~11km grid cell, generous on purpose
  return `geo:${lat.toFixed(precision)}:${lng.toFixed(precision)}`;
}

function getIO() {
  if (!ioInstance) throw new Error('Socket.io not initialized yet');
  return ioInstance;
}

/** Notify everyone in the coarse grid cells surrounding a point of a new listing. */
function broadcastNewListing(listing) {
  if (!ioInstance) return;
  const [lng, lat] = listing.location.coordinates;
  // notify the exact cell plus the 8 neighboring cells so edge cases aren't missed
  for (let dLat = -1; dLat <= 1; dLat += 1) {
    for (let dLng = -1; dLng <= 1; dLng += 1) {
      const cell = geoCell(lat + dLat, lng + dLng);
      ioInstance.to(cell).emit('listing:new', listing);
    }
  }
}

function notifyUser(userId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}

module.exports = { initSocket, getIO, broadcastNewListing, notifyUser };
