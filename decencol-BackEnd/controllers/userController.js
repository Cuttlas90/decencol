let uuid = require("uuid");
let model = require('../models/index');
var Web3 = require('web3');
var fs = require('fs');
var path = require('path');
var comparator = require("../node_modules/file-diff-parser/index.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");
let node;
const STATUS_PENDING = 0;
const STATUS_APPROVE = 1;
const STATUS_REJECT = 2;

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

        const { create } = await import('ipfs-core');
        if(!node)
            node = await create();
        
        var mainJson = [];
        var contents = req.body.content.split('\n');
        for(var line in contents) {
            var mainObj = {};
            mainObj['id'] = Date.now();
            mainObj['key'] = contents[line].replaceAll('\r', '');
            mainObj['data'] = [];
            var itemObj = {};
            itemObj['user'] = user.ethereumAddress;
            itemObj['action'] = '+';
            itemObj['oldValue'] = '';
            itemObj['newValue'] = contents[line].replaceAll('\r', '');
            itemObj['status'] = STATUS_APPROVE;
            itemObj['id'] = Date.now();
            mainObj['data'].push(itemObj);
            mainJson.push(mainObj);
        }
        
        let fileName = uuid.v4() + '.txt';
        const file = await node.add({
            path: fileName,
            content: JSON.stringify(mainJson)
            })

        let data = req.body;
        data.fileName = file.path;
        data.creatorId = req.userId;
        data.creatorAddress = user.ethereumAddress;
        data.ipfsAddress = file.cid.toString();
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
        model.Files.findAll({ where: {creatorId: req.userId} })
            .then(files => {
                if(!files) return res.json({ hasError: false, data: {}, error: { message: 'No files found' } });
                res.json({ hasError: false, data: files, message: 'get files successfully' })
            })
            .catch(error => {
                res.json({ hasError: true, data: {}, error: error })
            });
    },
    getSharedByFiles: async function (req, res, next) {
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });
        var sharedFiles = await model.sequelize.query('SELECT "files".* FROM "files" JOIN "shareList" ON files.id = "shareList"."fileId" WHERE "shareList"."userAddress" = ?', { replacements: [user.ethereumAddress] });
        if(!sharedFiles) return res.json({ hasError: true, data: {}, error: { message: 'Fetch data error' } });
        res.json({ hasError: false, data: sharedFiles[0], message: 'get sharedByFiles successfully' })
    },
    getSharedList: async function (req, res, next) {
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });
        let file = await model.Files.findOne({ where: { creatorId: req.userId, id : req.params.id } })
        if (!file) return res.json({ hasError: true, data: {}, error: { message: 'File not found' } });

        model.ShareList.findAll({ where: {fileId: req.params.id} })
            .then(list => {
                if(!list) return res.json({ hasError: true, data: {}, error: { message: 'No share found' } });
                res.json({ hasError: false, data: list, message: 'get ShareList successfully' })
            })
            .catch(error => {
                res.json({ hasError: true, data: {}, error: error })
            });
    },
    shareFile: async function (req, res, next) {
        var data = {
            result : []
        };
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });
        
        let file = await model.Files.findOne({ where: { creatorId: req.userId, id : req.body.fileId } })
        if (!file) return res.json({ hasError: true, data: {}, error: { message: 'File not found' } });

        for(var u in req.body.ethereumAddress){
            let secondUser = await model.User.findOne({ where: { ethereumAddress: req.body.ethereumAddress[u] } });
            if(!secondUser)
                data.result.push({ethereumAddress : req.body.ethereumAddress[u], status: 1 , message: "User not found"});
            else{
                if(user.ethereumAddress == secondUser.ethereumAddress){
                    data.result.push({ethereumAddress : req.body.ethereumAddress[u], status: 2 , message: "Both users are the same"});
                    continue;
                } 
                let shared = await model.ShareList.findOne({ where: { fileId: req.body.fileId, userAddress : req.body.ethereumAddress[u]} });
                if(shared){
                    data.result.push({ethereumAddress : req.body.ethereumAddress[u], status: 0 , message: "Shared successfully"});
                    continue;
                }
                var sh = await model.ShareList.create({fileId: req.body.fileId, userAddress : req.body.ethereumAddress[u]});
                if(sh)
                    data.result.push({ethereumAddress : req.body.ethereumAddress[u], status: 0 , message: "Shared successfully"});
                else
                    res.json({ hasError: true, data: {}, error: error })
            }
            
        }
        res.json({ hasError: false, data: data });
        
    },
    removeShare: async function (req, res, next) {
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });
        
        let file = await model.Files.findOne({ where: { creatorId: req.userId, id : req.body.fileId } })
        if (!file) return res.json({ hasError: true, data: {}, error: { message: 'File not found' } });

        let tmp = await model.ShareList.findOne({ where: { userAddress: req.body.ethereumAddress, fileId : req.body.fileId } });
        if(tmp)
            await tmp.destroy();
        res.json({ hasError: false, data: {}, message: 'Remove share successfully' });
    },
    deleteFile: async function (req, res, next) {
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });
        
        let file = await model.Files.findOne({ where: { creatorId: req.userId, id : req.body.fileId } })
        if (!file) return res.json({ hasError: true, data: {}, error: { message: 'File not found' } });

        model.Files.destroy({ where: { id: req.body.fileId } })
            .then(f => {
                model.ShareList.destroy({ where: { fileId: req.body.fileId } })
                .then(s => {
                    res.json({ hasError: false, data: {}, message: 'delete file successfully' })
                }).catch(error => {
                    res.json({ hasError: true, data: {}, error: error })
                })
            }).catch(error => {
                res.json({ hasError: true, data: {}, error: error })
            })
    },
    getFile: async function (req, res, next) {
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });

        let file = await model.Files.findOne({ where: {creatorId : req.userId, id : req.params.id} });
        if(!file) {
            let tmp = await model.ShareList.findOne({ where: {userAddress : user.ethereumAddress, fileId : req.params.id} });
            if(!tmp) return res.json({ hasError: true, data: {}, error: { message: 'File not found' } });
            file = await model.Files.findOne({ where: {id : req.params.id} });
            if(!file) return res.json({ hasError: true, data: {}, error: { message: 'File not found' } });
        }

        const { create } = await import('ipfs-core');
        if(!node)
            node = await create();
        let content = '';
        const decoder = new TextDecoder();
        for await (const chunk of node.cat(file.ipfsAddress)) {
            content += decoder.decode(chunk, {
                stream: true
            })
        }
        let data = {
            fileId : file.id,
            fileName : file.fileName,
            content : content
        }
        res.json({ hasError: false, data: data, message: 'get file successfully' })
    },
    editFile: async function (req, res, next) {
        var role = -1;
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });
        let file = await model.Files.findOne({ where: {creatorId : req.userId, id : req.body.fileId} });
        if(!file) {
            let tmp = await model.ShareList.findOne({ where: {userAddress : user.ethereumAddress, fileId : req.body.fileId} });
            if(!tmp) return res.json({ hasError: true, data: {}, error: { message: 'File not found' } });
            file = await model.Files.findOne({ where: {id : req.body.fileId} });
            if(!file) return res.json({ hasError: true, data: {}, error: { message: 'File not found' } });
            role = 1; //Shared by
        }
        else
            role = 0; //Owner

        const { create } = await import('ipfs-core');
        if(!node)
            node = await create();
        let content = '';
        const decoder = new TextDecoder();
        for await (const chunk of node.cat(file.ipfsAddress)) {
            content += decoder.decode(chunk, {
                stream: true
            })
        }
        //----------------------------------------------------------------
        var rootPath = process.cwd();
        // process.chdir(path.join(rootPath, "/bin"));
        rootPath = process.cwd();
        let mainFileName = uuid.v4() + '.txt';
        var jsonData = JSON.parse(content);
        for(var item in jsonData) {
            var line = null;
            for(var i in jsonData[item].data) {
                if(jsonData[item].data[i].status == STATUS_APPROVE)
                    if(jsonData[item].data[i].action == '=')
                        line = jsonData[item].key;
                    else if(jsonData[item].data[i].action == '*' || jsonData[item].data[i].action == '+')
                        line = jsonData[item].data[i].newValue;
                    else if(jsonData[item].data[i].action == '-')
                        line = null;
            }
            if(line != null){
                fs.appendFileSync("../tmpFile/" + mainFileName, line);
                if(line.length > 0)
                    fs.appendFileSync("../tmpFile/" + mainFileName, '\n');
            }
        }
        let newFileName = uuid.v4() + '.txt';
        fs.writeFileSync("../tmpFile/" + newFileName, req.body.content);
        var data = [];
        var mainFile = path.join(rootPath, "../tmpFile/" + mainFileName);
        var newFile = path.join(rootPath, "../tmpFile/" + newFileName);
        comparator.compare(mainFile, newFile, async function (result) {
            var actual = result.split('\n');
            console.log(actual)
            for(var line in actual) 
                data.push(actual[line].replaceAll('\r', '').replaceAll('\t', ','));
            
            var lastProc = -1;
            for(var item in data) {
                var changeArray = data[item].split(',');
                switch(changeArray[1]) {
                    case '=':
                        lastProc++;
                        break;
                    case '+':
                        lastProc++;
                        var mainObj = {};
                        mainObj['id'] = Date.now();
                        mainObj['key'] = changeArray[2];
                        mainObj['data'] = [];
                        var itemObj = {};
                        itemObj['user'] = user.ethereumAddress;
                        itemObj['action'] = '+';
                        itemObj['oldValue'] = '';
                        itemObj['newValue'] = changeArray[2];
                        itemObj['status'] = (role == 0 ? STATUS_APPROVE : STATUS_PENDING);
                        itemObj['id'] = Date.now();
                        mainObj['data'].push(itemObj)
                        jsonData.splice(lastProc, 0, mainObj);

                        console.log('+')
                        break;
                    case '-':
                        for(var item in jsonData) {
                            if(item <= lastProc)
                                continue;
                            if(jsonData[item].key == changeArray[2]) {
                                if(role == 0) {
                                    for(var dataItem in jsonData[item].data)
                                        jsonData[item].data[dataItem].status = STATUS_REJECT;
                                }
                                var itemObj = {};
                                itemObj['user'] = user.ethereumAddress;
                                itemObj['action'] = changeArray[1];
                                itemObj['oldValue'] = changeArray[2];
                                itemObj['newValue'] = '';
                                itemObj['status'] = (role == 0 ? STATUS_APPROVE : STATUS_PENDING);
                                itemObj['id'] = Date.now();
                                jsonData[item].data.push(itemObj);
                                lastProc = item;
                                break;
                            }
                        }
                        console.log('*')
                        break;
                    case '*':
                        var actual = changeArray[2].split('|');
                        for(var item in jsonData) {
                            if(item <= lastProc)
                                continue;
                            if(jsonData[item].key == actual[0]) {
                                if(role == 0) {
                                    for(var dataItem in jsonData[item].data)
                                        jsonData[item].data[dataItem].status = STATUS_REJECT;
                                    jsonData[item].key = actual[1];
                                    jsonData[item].id = Date.now();
                                }
                                var itemObj = {};
                                itemObj['user'] = user.ethereumAddress;
                                itemObj['action'] = changeArray[1];
                                itemObj['oldValue'] = actual[0];
                                itemObj['newValue'] = actual[1];
                                itemObj['status'] = (role == 0 ? STATUS_APPROVE : STATUS_PENDING);
                                itemObj['id'] = Date.now();
                                jsonData[item].data.push(itemObj);
                                lastProc = item;
                                break;
                            }
                        }
                        console.log('*')
                        break;
                    default:
                        break;
                    }
                    console.log('lastProc ' + lastProc)
            }
            if(!node)
                node = await create();
            let fileName = uuid.v4() + '.txt';
            const editedFile = await node.add({
                path: fileName,
                content: JSON.stringify(jsonData)
                })
            
            file.ipfsAddress = editedFile.cid.toString();
            file.fileName = fileName;
            file.lastUpdate = new Date().toISOString();
            file.save()
                .then(t => {
                    res.json({ hasError: false, data: {} })
                })
                .catch(error => {
                    res.json({ hasError: true, data: {}, error: error })
                });
        });
        //----------------------------------------------------------------

        
    },
    review: async function (req, res, next) {
        let user = await model.User.findOne({ where: { id: req.userId } });
        if (!user) return res.json({ hasError: true, data: {}, error: { message: 'User not found' } });
        let file = await model.Files.findOne({ where: {creatorId : req.userId, id : req.body.fileId} });
        if(!file) return res.json({ hasError: true, data: {}, error: { message: 'File not found' } });
        const { create } = await import('ipfs-core');
        if(!node)
            node = await create();
        let content = '';
        const decoder = new TextDecoder();
        for await (const chunk of node.cat(file.ipfsAddress)) {
            content += decoder.decode(chunk, {
                stream: true
            })
        }
        var jsonData = JSON.parse(content);
        for(var item in jsonData) {
            if(jsonData[item].key == req.body.key && jsonData[item].id == req.body.keyId) {
                for(var dataItem in jsonData[item].data) {
                    if(jsonData[item].data[dataItem].id == req.body.changeId) {
                        if(req.body.action == STATUS_APPROVE)
                            for(var i in jsonData[item].data)
                                jsonData[item].data[i].status = STATUS_REJECT;
                        jsonData[item].data[dataItem].status = req.body.action;
                        if(jsonData[item].data[dataItem].action == '*')
                            jsonData[item].key = jsonData[item].data[dataItem].newValue;
                        break;
                    }
                }
                break;
            }
        }
        if(!node)
            node = await create();
        let fileName = uuid.v4() + '.txt';
        const editedFile = await node.add({
            path: fileName,
            content: JSON.stringify(jsonData)
            })
        
        file.ipfsAddress = editedFile.cid.toString();
        file.fileName = fileName;
        file.lastUpdate = new Date().toISOString();
        file.save()
            .then(t => {
                res.json({ hasError: false, data: {} })
            })
            .catch(error => {
                res.json({ hasError: true, data: {}, error: error })
            });
    },
};