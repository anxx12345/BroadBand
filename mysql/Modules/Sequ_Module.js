const Sequelize = require('sequelize');
const config = require('../../keys').dbconfig;

let sequelize = new  Sequelize(config.database,config.username,config.password,{
    host:config.host,
    dialect:'mysql',
    pool:{
        max:5,
        mini:0,
        idle:30000
    }
});

let Sequ_Module = sequelize.define('OLT', {
    id:{
        type:Sequelize.STRING(50),
        primaryKey: true
    },
    name: Sequelize.STRING(100),
    start_time: Sequelize.INTEGER(30),
    end_time: Sequelize.STRING(30),
}, {
    timestamps:false,
    freezeTableName: true
});

module.exports = {
    sequelize:sequelize,
    MOD:Sequ_Module
};
