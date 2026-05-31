"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LocationMappings", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      provinceCode: {
        type: Sequelize.STRING(20),
        allowNull: false
      },

      districtCode: {
        type: Sequelize.STRING(20),
        allowNull: false
      },

      ghnProvinceId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      ghnDistrictId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      wardCode: {
        type: Sequelize.STRING(20),
        allowNull: true
      },

      ghnWardCode: {
        type: Sequelize.STRING(20),
        allowNull: true
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
    await queryInterface.addIndex("LocationMappings", ["provinceCode","districtCode"], {
      unique: true,
      name: "location_mappings_province_code_district_code"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("LocationMappings");
  },
};
