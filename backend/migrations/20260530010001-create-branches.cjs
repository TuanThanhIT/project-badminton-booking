"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Branches", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      branchName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },

      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      address: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      districtName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      provinceName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      wardName: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      provinceId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      districtId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      wardCode: {
        type: Sequelize.STRING(20),
        allowNull: true
      },

      latitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },

      longitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      ghnShopId: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex("Branches", ["provinceId"], {
      name: "branches_province_id"
    });

    await queryInterface.addIndex("Branches", ["districtId"], {
      name: "branches_district_id"
    });

    await queryInterface.addIndex("Branches", ["isActive"], {
      name: "branches_is_active"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Branches");
  },
};
