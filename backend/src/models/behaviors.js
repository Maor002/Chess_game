module.exports = {
    preSave: function (next) {
        logger.info("🔹 Pre-save hook executed");
        next();
    },
    print: function () {
        logger.info(`🔹 User: ${this.username}, Email: ${this.email}`);
    },
    isOnline: function () {
        return this.status === 'online';
    },
    generateRoomCode: async function () {
        let code;
        let existingRoom;
        do {
          code = Math.floor(100000 + Math.random() * 900000).toString(); // מספר בן 6 ספרות
          existingRoom = await Room.findOne({ code });
        } while (existingRoom);
        return code;
    }
};
