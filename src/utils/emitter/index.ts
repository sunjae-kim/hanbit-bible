import mitt from 'mitt'

type EventTypes = {} & any

const emitter = mitt<EventTypes>()

export { emitter }
