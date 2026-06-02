"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Suppliers", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      supplierName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "ACTIVE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE Suppliers
      ADD CONSTRAINT check_suppliers_status
      CHECK (status IN ('ACTIVE', 'INACTIVE'))
    `);
    await queryInterface.addIndex("Suppliers", ["status"], {
      name: "suppliers_status",
    });
    await queryInterface.addIndex("Suppliers", ["supplierName"], {
      name: "suppliers_supplier_name",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Suppliers");
  },
};
