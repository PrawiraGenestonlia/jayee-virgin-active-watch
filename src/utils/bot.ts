import { Telegraf } from 'telegraf'

const globalForBot = global as unknown as { bot: Telegraf, notification: { notify: boolean, setNotification: (arg0: boolean) => void } }

const createNewBot = () => {
	const bot = new Telegraf(process.env.BOT_TOKEN || '')
	bot.start((ctx) => ctx.reply('Welcome'))
	bot.help((ctx) => ctx.reply('Send me a sticker'))
	bot.command('notify', (ctx) => {
		toNotify.setNotification(true)
		void ctx.reply(JSON.stringify(toNotify))
	})
	bot.command('disable', (ctx) => {
		toNotify.setNotification(false)
		void ctx.reply(JSON.stringify(toNotify))
	})
	bot.hears('hi', (ctx) => ctx.reply('Hey there'))
	bot.on('message', (ctx) => {
		void ctx.reply('👍')
	})
	void bot.launch()
	return bot
}

export const bot =
	globalForBot.bot || createNewBot()

export const toNotify = globalForBot.notification || {
	notify: true,
	setNotification: (value: boolean) => {
		toNotify.notify = value
	}
}

if (process.env.NODE_ENV !== 'production') {
	globalForBot.bot = bot
	globalForBot.notification = toNotify
}