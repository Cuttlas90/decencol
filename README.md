
# Decencol

decencol is an online collaboration tool that use IPFS protocol for sharing and storing files.

## Version 2 features

- multi-share: the current version gives owner the ability of sharing his/her file with one co-worker, multi-share feature will give owner ability of sharing the file with more people, it means bigger teams can collaborate on file at the same time.
- Adding comparison feature (v.1): owner and his/her co-workers can work on a same document. After a co-worker made some changes and save the file, the original and modified files are compared line by line for finding changes, found changes will be added to the original file as a text, after that owner can see the file and its change, owner can modify the document based on proposed changes and save the file as a final version. In this version only text differences can be found.
- migrating from web3.storage to ipfs.js: to build the MVP we used web3.storage but for further development we need to interact with IPFS directly.

## Version 1 features

- storing data on IPFS
- sharing file with one person, using Ethereum address
