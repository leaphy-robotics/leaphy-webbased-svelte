import { record } from 'rrweb'
import {io} from "socket.io-client";

export default function setupRecording(username: string) {
	const socket = io('http://204.2.69.52:5173', {
		extraHeaders: {
			username
		}
	})

	let events = []
	record({
		emit(event) {
			events.push(event)
		}
	})

	function send() {
		console.log('send')
		socket.emit('write', {
			data: events.map(e => JSON.stringify(e)).join('\n')
		})
		events = []
	}

	socket.on('connect', () => {
		setInterval(send, 10 * 1000)
	})
}
