/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { bot, toNotify } from '@src/utils/bot'
import axios from 'axios'
import { type NextApiRequest, type NextApiResponse } from 'next'

const getWatchList = async () => {
	try {
		const response = await axios.get('https://hal.virginactive.com.sg/api/watchlist/get', {
			'headers': {
				'accept': 'application/json, text/plain, */*',
				'accept-language': 'en-US,en;q=0.9',
				'authorization': `Bearer ${process.env.VA_TOKEN || ''}`,
				'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-platform': '"macOS"',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-site',
				'x-mylocker-language': 'en-SG',
				'Referer': 'https://mylocker.virginactive.com.sg/',
				'Referrer-Policy': 'strict-origin-when-cross-origin'
			},
		})
		if (response?.data.length) {
			let notify = false
			response.data.forEach((item: any) => {
				if (item.HasSpaces === true) {
					notify = true
				}
			})
			return { notify, data: response?.data || [] }
		} else {
			return { notify: false, data: [] }
		}
	} catch (error) {
		console.error(error)
		return { notify: false, data: [] }
	}

}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if (req.method === 'GET') {
			const data = await getWatchList()
			if (process.env.FORCE_SEND_STATUS || data.notify) {
				if (toNotify.notify) {
					console.log('Sending notification to telegram...')
					await bot.telegram.sendMessage(process.env.BOT_CHAT_ID || '', JSON.stringify(data))
				}
			}
			res.status(200).json(data)
		} else {
			res.setHeader('Allow', ['GET'])
			res.status(405).end(`Method ${req.method || ''} Not Allowed`)
		}
	} catch (error) {
		res.status(400).json(error)
	}
}