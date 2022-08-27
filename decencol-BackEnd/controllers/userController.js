let uuid = require("uuid");
var request = require('request');
let model = require('../models/index');
var Web3 = require('web3');
var fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");
let client = require('web3.storage');
const we3StorageToken = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

module.exports = {
    getNonce: async function (req, res, next) {
        let user = await model.User.findOne({ where: { ethereumAddress: req.body.ethereumAddress } });
        var nonce = uuid.v4();
        if(user){
            user.nonce = nonce;
            user.save()
                .then(user => {
                    res.json({ hasError: false, data: {nonce: nonce}, message: 'user created successfully' })
                })
                .catch(error => {
                    res.json({ hasError: true, data: {}, error: error })
                });
        }
        else{
            let data = req.body;
            data.nonce = nonce;
            model.User.create(data)
                .then(user => {
                    res.json({ hasError: false, data: {nonce: nonce}, message: 'user created successfully' })
                })
                .catch(error => {
                    res.json({ hasError: true, data: {}, error: error })
                });
        }
    },
    loginWithPublicKey: async function (req, res, next) {
        let user = await model.User.findOne({ where: { ethereumAddress: req.body.ethereumAddress } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });
        var web3 = new Web3(Web3.givenProvider);
        let address = web3.eth.accounts.recover(user.nonce, req.body.signature);
        
        if (address.toString().toLowerCase() == user.ethereumAddress) {
            let token = jwt.sign({
                data: { ethereumAddress: user.ethereumAddress, id: user.id }
            }, 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', { expiresIn: '1d' });
            res.json({ hasError: false, data: { token: token, ethereumAddress: user.ethereumAddress, userId: user.id } });
        } else {
            res.json({ hasError: true, data: [], error: { message: 'Invalid signature' } })
        }
    },
    createFile: async function (req, res, next) {
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });
        let fileName = './tmpFile/' + uuid.v4() + '.txt';
        fs.writeFileSync(fileName, req.body.content);
        const storage = new client.Web3Storage({ token : we3StorageToken });

        const pathFile = await client.getFilesFromPath(fileName);
        const cid = await storage.put(pathFile);
        fs.unlinkSync(fileName);

        let data = req.body;
        data.creatorId = req.userId;
        data.creatorAddress = user.ethereumAddress;
        data.ipfsAddress = cid;
        model.Files.create(data)
            .then(file => {
                res.json({ hasError: false, data: {fileId: file.id}, message: 'file created successfully' })
            })
            .catch(error => {
                res.json({ hasError: true, data: {}, error: error })
            });
    },
    getMyFiles: async function (req, res, next) {
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });
        model.Files.findAll({ where: {[Op.or]: [{creatorId: req.userId}, {sharedWith: req.userId}]} })
            .then(files => {
                if(!files) return res.json({ hasError: false, data: {}, error: { message: 'No files found' } });
                res.json({ hasError: false, data: files, message: 'get files successfully' })
            })
            .catch(error => {
                res.json({ hasError: true, data: {}, error: error })
            });
    },
    shareFile: async function (req, res, next) {
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });
        let secondUser = await model.User.findOne({ where: { ethereumAddress: req.body.ethereumAddress } });
        if(!secondUser) return res.json({ hasError: true, data: {}, error: { message: 'Second User not found' } });
        if(user.ethereumAddress == secondUser.ethereumAddress) return res.json({ hasError: true, data: {}, error: { message: 'Both users are the same' } });

        model.Files.findOne({ where: { creatorId: req.userId, id : req.body.fileId } })
            .then(file => {
                if(!file) return res.json({ hasError: false, data: {}, error: { message: 'File not found' } });
                file.sharedWith = secondUser.id;
                file.sharedWithAddress =secondUser.ethereumAddress;
                file.save()
                    .then(t => {
                        res.json({ hasError: false, data: {}, message: 'file shared successfully'  })
                    })
                    .catch(error => {
                        res.json({ hasError: true, data: {}, error: error })
                    });
            })
            .catch(error => {
                res.json({ hasError: true, data: {}, error: error })
            });
    },
    getFile: async function (req, res, next) {
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });

        model.Files.findOne({ where: {[Op.or]: [{creatorId: req.userId}, {sharedWith: req.userId}], id : req.params.id} })
            .then(async file => {
                if(!file) return res.json({ hasError: true, data: {}, error: { message: 'File not found' } });
                const storage = new client.Web3Storage({ token : we3StorageToken });
                var url = '';
                const ress = await storage.get(file.ipfsAddress);
                const files = await ress.files()
                for (const file of files) 
                    url = 'https://'+file.cid+'.ipfs.dweb.link';
                request(url, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        let data = {
                            fileId : file.id,
                            fileName : file.fileName,
                            content : body
                        }
                        res.json({ hasError: false, data: data, message: 'get file successfully' })
                    }
                    else{
                        res.json({ hasError: true, data: {}, error: error })
                    }
                });
            })
            .catch(error => {
                res.json({ hasError: true, data: {}, error: error })
            });
    },
    editFile: async function (req, res, next) {
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });
        model.Files.findOne({ where: {[Op.or]: [{creatorId: req.userId}, {sharedWith: req.userId}], id : req.body.fileId} })
            .then(async file => {
                if(!file) return res.json({ hasError: true, data: {}, error: { message: 'File not found' } });
                let fileName = './tmpFile/' + uuid.v4() + '.txt';
                fs.writeFileSync(fileName, req.body.content);
                const storage = new client.Web3Storage({ token : we3StorageToken });

                const pathFile = await client.getFilesFromPath(fileName);
                const cid = await storage.put(pathFile);
                fs.unlinkSync(fileName);
                file.ipfsAddress = cid;
                file.lastUpdate = new Date().toISOString();
                file.save()
                    .then(t => {
                        res.json({ hasError: false, data: {} })
                    })
                    .catch(error => {
                        res.json({ hasError: true, data: {}, error: error })
                    });
            })
            .catch(error => {
                res.json({ hasError: true, data: {}, error: error })
            });
    },
};