"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserAddresses", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      fullName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false
      },

      address: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      provinceName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      districtName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      wardName: {
        type: Sequelize.STRING(100),
        allowNull: false
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
        allowNull: false
      },

      latitude: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      longitude: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      label: {
        type: Sequelize.ENUM("HOME", "OFFICE"),
        allowNull: false,
        defaultValue: "HOME"
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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
    await queryInterface.addIndex("UserAddresses", ["userId"], {
      name: "user_addresses_user_id"
    });

    await queryInterface.addIndex("UserAddresses", ["provinceId"], {
      name: "user_addresses_province_id"
    });

    await queryInterface.addIndex("UserAddresses", ["districtId"], {
      name: "user_addresses_district_id"
    });

    await queryInterface.addIndex("UserAddresses", ["wardCode"], {
      name: "user_addresses_ward_code"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("UserAddresses");
  },
};
