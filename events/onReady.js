require('dotenv').config();
const { REST, Routes, Collection, ActivityType } = require('discord.js');
const ethers = require('ethers');

async function onReady(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`)

    const up = "\u2B08"
    const down = "\u2B0A"
    const mid = "\u22EF"
  
    var guild = await client.guilds.cache.get(`${process.env.GUILD_ID}`)
    //console.log(guild)
    var member = await guild.members.cache.get(`${process.env.CLIENT_ID}`)
    //console.log(member)
    var red = await guild.roles.cache.find(role => role.name === 'tickers-red')
    //console.log(red)
    var green = await guild.roles.cache.find(role => role.name === 'tickers-green')
    //console.log(green)

    var lastPrice
    var currentPrice
    var arrow

    var sgbPrice
    
    var provider = new ethers.JsonRpcProvider(
      process.env.RPC_PROVIDER
    )
    
    const ftsoRegistry = {
      address: "0x6D222fb4544ba230d4b90BA1BfC0A01A94E6cB23",
      abi: [
        {
          type: "function",
          stateMutability: "view",
          outputs: [
            { type: "uint256", name: "_price", internalType: "uint256" },
            { type: "uint256", name: "_timestamp", internalType: "uint256" },
          ],
          name: "getCurrentPrice",
          inputs: [{ type: "string", name: "_symbol", internalType: "string" }],
        },
        {
          type: "function",
          stateMutability: "view",
          outputs: [
            { type: "uint256", name: "_price", internalType: "uint256" },
            { type: "uint256", name: "_timestamp", internalType: "uint256" },
          ],
          name: "getCurrentPrice",
          inputs: [
            { type: "uint256", name: "_assetIndex", internalType: "uint256" },
          ],
        },
      ],
    }
    
    // Create FTSO Registry contract instance
    const ftsoRegistryContract = new ethers.Contract(
      ftsoRegistry.address,
      ftsoRegistry.abi,
      provider
    )
    
    async function clearRoles() {
      await member.roles.remove(red)
      await member.roles.remove(green)
    }
    
    async function setRed() {
      console.log('Setting Red Role Now...')
      await clearRoles()
      await member.roles.add(red)
      let redRole = await member.roles.cache.some(role => role.name === ('tickers-red'))
      console.log ('Attempted adding of redRole, if successful, this should be true:', redRole)
      if (!redRole) {
         console.log ('ERROR, still showing false for redRole... trying again...')
         await (member.roles.add(red))
         let redRole = await member.roles.cache.some(role => role.name === ('tickers-red'))
         console.log ('Attempted 2nd adding of redRole, if successful, this should be true:', redRole)
      }
    }
    
    async function setGreen() {
      console.log('Setting Green Role Now...')
      await clearRoles()
      await member.roles.add(green)
      let greenRole = await member.roles.cache.some(role => role.name === ('tickers-green'))
      console.log ('Attempted adding of greenRole, if successful, this should be true:', greenRole)
      if (!greenRole) {
         console.log ('ERROR, still showing false for greenRole... trying again...')
         await (member.roles.add(green))
         let greenRole = await member.roles.cache.some(role => role.name === ('tickers-green'))
         console.log ('Attempted 2nd adding of greenRole, if successful, this should be true:', greenRole)
      }
    }
    
    async function getInitialPrice() {
      let sgbBN = await ftsoRegistryContract["getCurrentPrice(string)"]("SGB")
      //console.log(sgbBN)
      let sgb = Number(sgbBN._price) / 10 ** 5;
      //console.log(sgb);
      sgbPrice = sgb;
    
      let ftso = {
        address: process.env.FTSO_ADDRESS,
        abi: [
          {
                  "inputs": [
                          {
                                  "internalType": "uint256",
                                  "name": "amountIn",
                                  "type": "uint256"
                          },
                          {
                                  "internalType": "address[]",
                                  "name": "path",
                                  "type": "address[]"
                          }
                  ],
                  "name": "getAmountsOut",
                  "outputs": [
                          {
                                  "internalType": "uint256[]",
                                  "name": "amounts",
                                  "type": "uint256[]"
                          }
                  ],
                  "stateMutability": "view",
                  "type": "function"
          }
        ],
      };
    
      const ftsoContract = new ethers.Contract(ftso.address, ftso.abi, provider)
    
      //console.log(ftsoContract)
    
      const WSB_ADDRESS = process.env.WBASE_ADDRESS
      const wsb = process.env.WBASE_TOKEN
      const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS
      const token = process.env.PAIR_TOKEN 
    
      let arryPrice = await ftsoContract.getAmountsOut(
          ethers.parseEther("1"),
          [WSB_ADDRESS, TOKEN_ADDRESS]
      )

      //console.log(arryPrice[0])
      //console.log(arryPrice[1])

      let wsbSGBPrice = Number(arryPrice[0]) / 10 ** 18
      let tokenSGBPrice = (Number(arryPrice[1]) / 10 ** 18).toFixed(5)
    
      /*
      On ethers V5 the output is usually a object with two fields, isBignumber (boolean) and _hex field 
      with a string representing the hexadecimal value of that number. So you need to pass inside 
      Number(bigNumber._hex) in orther to make math. Ethers V6 would returning straight a BigInt(), 
      big integers can do math with eachother but if you try to perform math between a big integer and 
      a regular number it will also complain. Again you need to pass it inside Number().
      */
      //let wsbSGBPrice = Number(arryPrice[0]._hex) / 10 ** 18
      //let sprkSGBPrice = (Number(arryPrice[1]._hex) / 10 ** 18).toFixed(5)
      //console.log(wsbSGBPrice)
      //console.log(tokenSGBPrice)
      let wsbUSDPrice = (sgbPrice / wsbSGBPrice).toFixed(5)
      let tokenUSDPrice = (sgbPrice / tokenSGBPrice).toFixed(5)
      console.log(wsb + " USD price is " + wsbUSDPrice)
      console.log(token + " USD price is " + tokenUSDPrice)
    
      clearRoles()
      lastPrice = tokenUSDPrice || 0
      let symbol = `${process.env.PAIR_TOKEN.toUpperCase()}`
      client.user.setPresence({
        activities: [{
        name: `SGB=${tokenSGBPrice} ${symbol}`,
        type: ActivityType.Watching
        }]
      })
    
      arrow = mid
      //client.guilds.cache.find(guild => guild.id === process.env.SERVER_ID).me.setNickname(`${symbol} ${arrow} ${process.env.CURRENCY_SYMBOL}${sprkUSDPrice}`)
      member.setNickname(`${symbol} ${arrow} ${process.env.CURRENCY_SYMBOL}${tokenUSDPrice}`)
      
      console.log('Initial price to', lastPrice)
      //console.log(`SGB: ${sgbPrice} per ${symbol}`)
    }
     
    async function getPrices() {
      let sgbBN = await ftsoRegistryContract["getCurrentPrice(string)"]("SGB")
      let sgb = Number(sgbBN._price) / 10 ** 5;
      //console.log(sgb);
      sgbPrice = sgb;
    
      let ftso = {
        address: process.env.FTSO_ADDRESS,
        abi: [
          {
                  "inputs": [
                          {
                                  "internalType": "uint256",
                                  "name": "amountIn",
                                  "type": "uint256"
                          },
                          {
                                  "internalType": "address[]",
                                  "name": "path",
                                  "type": "address[]"
                          }
                  ],
                  "name": "getAmountsOut",
                  "outputs": [
                          {
                                  "internalType": "uint256[]",
                                  "name": "amounts",
                                  "type": "uint256[]"
                          }
                  ],
                  "stateMutability": "view",
                  "type": "function"
          }
        ],
      };
    
      const ftsoContract = new ethers.Contract(ftso.address, ftso.abi, provider)
    
      //console.log(ftsoContract)
    
      const WSB_ADDRESS = process.env.WBASE_ADDRESS
      const wsb = process.env.WBASE_TOKEN
      const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS
      const token = process.env.PAIR_TOKEN 
    
      let arryPrice = await ftsoContract.getAmountsOut(
          ethers.parseEther("1"),
          [WSB_ADDRESS, TOKEN_ADDRESS]
      )

      //console.log(arryPrice[0])
      //console.log(arryPrice[1])

      let wsbSGBPrice = Number(arryPrice[0]) / 10 ** 18
      let tokenSGBPrice = (Number(arryPrice[1]) / 10 ** 18).toFixed(5)
    
      let wsbUSDPrice = (sgbPrice / wsbSGBPrice).toFixed(5)
      let tokenUSDPrice = (sgbPrice / tokenSGBPrice).toFixed(5)
      console.log(wsb + " USD price is " + wsbUSDPrice)
      console.log(token + " USD price is " + tokenUSDPrice)
    
      currentPrice = tokenUSDPrice || 0
      let symbol = `${process.env.PAIR_TOKEN.toUpperCase()}`
      client.user.setPresence({
        activities: [{
        name: `SGB=${tokenSGBPrice} ${symbol}`,
        type: `PLAYING`
        }]
      })
    
      console.log('The lastPrice:', lastPrice)
      console.log('The currentPrice:', currentPrice)
      if (currentPrice > lastPrice) {
        console.log('up')
        arrow = up
        setGreen()
        } else if (currentPrice < lastPrice) {
          console.log('down')
          arrow = down
          setRed()
          } else {
            console.log('same')
          }
    
      //client.guilds.cache.find(guild => guild.id === process.env.SERVER_ID).me.setNickname(`${symbol} ${arrow} ${process.env.CURRENCY_SYMBOL}${sprkUSDPrice}`)
      member.setNickname(`${symbol} ${arrow} ${process.env.CURRENCY_SYMBOL}${tokenUSDPrice}`)
    
      //console.log('Current price to', currentPrice)
      //console.log(`SGB: ${sgbPrice} per ${symbol}`)
    
      lastPrice = currentPrice
    }
    
    getInitialPrice() // Ping server once on startup
    // Ping the server and set the new status message every x minutes. (Minimum of 1 minute)
    setInterval(getPrices, Math.max(1, process.env.UPDATE_FREQUENCY || 1) * 60 * 1000)
}
    
module.exports = { 
    onReady
}