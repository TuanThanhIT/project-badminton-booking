"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Feedbacks", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
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

      orderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Orders",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      variantId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "ProductVariants",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      branchId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Branches",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      content: {
        type: Sequelize.STRING(1000),
        allowNull: false
      },

      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    await queryInterface.sequelize.query(`
      ALTER TABLE Feedbacks
      ADD CONSTRAINT check_feedbacks_rating_range
      CHECK (rating BETWEEN 1 AND 5)
    `);
    await queryInterface.addIndex("Feedbacks", ["userId"], {
      name: "feedbacks_user_id"
    });

    await queryInterface.addIndex("Feedbacks", ["orderId"], {
      name: "feedbacks_order_id"
    });

    await queryInterface.addIndex("Feedbacks", ["variantId"], {
      name: "feedbacks_variant_id"
    });

    await queryInterface.addIndex("Feedbacks", ["branchId"], {
      name: "feedbacks_branch_id"
    });

    await queryInterface.addIndex("Feedbacks", ["userId","branchId"], {
      unique: true,
      name: "feedbacks_user_id_branch_id"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Feedbacks");
  },
};
