import debug from 'debug'
import { providers, Wallet } from 'ethers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { GameItems__factory } from '../../contracts/typechain-types'
import { addresses, defaultNetwork } from '../../src/utils/networkSelector'

const log = debug('signup-api')
debug.enable('signup-api')

const chain = defaultNetwork()

const provider = new providers.StaticJsonRpcProvider(chain.rpcUrls.default)
const wallet = new Wallet(process.env.MINTER_PRIVATE_KEY!).connect(provider)

const gameItems = GameItems__factory.connect(addresses().GameItems, wallet) 

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  log('handling signup: ', req.body)
  const { address } = JSON.parse(req.body)
  const tx = await gameItems.initialMint(address)
  log('submitted ', address)
  return res.status(201).json({
    transactionHash: tx.hash,
  })
}

export default handler
