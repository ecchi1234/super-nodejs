type Handle = () => Promise<string>
const name: string = 'Dư Thanh Được'
const handle: Handle = () => Promise.resolve(name)
console.log(name)
handle().then(console.log)
