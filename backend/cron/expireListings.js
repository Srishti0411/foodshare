const cron = require('node-cron');
const FoodListing = require('../models/FoodListing');
const { notifyUser } = require('../socket');

// Runs every minute, flips any listing whose expiresAt has passed and is
// still 'available' over to 'expired'. Claimed listings are left alone -
// once claimed, expiry no longer applies, the pickup handoff takes over.
function startExpiryJob() {
  cron.schedule('* * * * *', async () => {
    try {
      const stale = await FoodListing.find({
        status: 'available',
        expiresAt: { $lte: new Date() },
      }).select('_id donor title');

      if (stale.length === 0) return;

      const ids = stale.map((l) => l._id);
      await FoodListing.updateMany({ _id: { $in: ids } }, { status: 'expired' });

      stale.forEach((listing) => {
        notifyUser(listing.donor, 'listing:expired', {
          listingId: listing._id,
          title: listing.title,
        });
      });

      console.log(`[cron] expired ${stale.length} stale listing(s)`);
    } catch (err) {
      console.error('[cron] expiry job failed:', err.message);
    }
  });
}

module.exports = startExpiryJob;
