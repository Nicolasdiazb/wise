const {moduleGameMemory_} = require('../module/moduleGameMemory')
const {players} = require('../module/modulePlayer')
const {games} = require('../module/moduleGame')

class logicGameMemory {
    constructor() {}
    
    createGameMemory(socket, io) {
        return (params) => {
            const player = players.getPlayer(socket.id)
            const game = games.getGame(player.hostId)
            const gameId = Math.floor(Math.random() * (9000 - 1000)) + 1000
            const response = this.createArray()

            const request = moduleGameMemory_.addGameMemory(game.pin, gameId, player.playerId, response)

            if (!request) {
                console.log('no se creo la partida')
            } else {
                console.log(`partida generada con el socket ${socket.id}`)
                const players = players.getPlayer(player.hostId)
                this.addPlayersGameCount(players, response, game.pin, gameId)
                players.forEach(element => {
                    if(element.onGame == false) {
                        io.to(element.id).emit('init-game-memory',{
                            response: response,
                            board: this.createArray()
                        })
                    }
                });
                
                
                console.log('se creo la partida')
            }
        }
    }

    resultGameMemory(socket, io) {
        return (params) => {
            const player = players.getPlayer(socket.id)
            const game = games.getGame(player.hostId)
            const gameMemory = moduleGameMemory_.getGame(game.pin)

            const response = moduleGameMemory_.addResultGameMemory(gameMemory.gameId, gameMemory.playerId, params.result)

            if (!response) {
                console.log('no se guardo el resultado')
            } else {
                console.log(`se guarda el resultado del socket ${socket.id}`)
                const players = players.getPlayer(player.hostId)
                const playersResult = moduleGameMemory_.getResultGame(gameMemory.gameId)
                players.forEach(element => {
                    io.to(element.playerId).emit('position-game-memory', this.positionGameMemory(playersResult, gameMemory.response))
                })

            }
        }
    }

    positionGameMemory(players, result) {
        const position = []
        players.forEach(element => {
            let player = element.response
            let points = 0
            for (let row = 0; row < player.length; row++) {
                
                for (let col = 0; col < player.length; col++) {
                    
                    if(resultPlayer[row][col] == result[row][col]) {
                        points += 1
                    }

                }

            }

            let resultPlayer = {
                playerId: element.playerId,
                points: points
            }

            position.push(resultPlayer)
        })
        
        position.sort(this.descendingOrder)

        return position

    }

    descendingOrder(a, b) {
        return b.points - a.points
    }

    addPlayersGameCount(players, response, game, gameId) {
        players.forEach(element => {
            if(element.onGame == false) {
                moduleGameCount_.addGameCount(game.pin, gameId, element.playerId, response)
            }
        });
    }

    createArray() {

        let result = []
        let number

        for (let row = 0; row < 3; row++) {
            result[row] = []
            for (let col = 0; col < 3; col++) {
                
                result[row][col] = '0'
                
            }
            
        }

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                
                number = Math.floor(Math.random() * (10 - 1)) + 1
                
                while(this.checkArray(result, number) == false ) {
                    number = Math.floor(Math.random() * (10 - 1)) + 1
                }
                
                result[row][col] = number
            }
            
        }

        return result
    
    }

    checkArray(arr, num) {

        for (let row = 0; row < 3; row++) {
            
            for (let col = 0; col < 3; col++) {
                
                if(arr[row][col] == num) {
                    return false
                }
                
            }
            
        }

        return true
    }
}

const logicGameMemory_ = new logicGameMemory()
module.exports = {logicGameMemory_}