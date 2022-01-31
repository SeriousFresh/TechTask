module.exports = {
  async up(queryInterface) {
    return queryInterface.dropAllTables();
  },

  async down() {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
