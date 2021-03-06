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
            const gameMemory = moduleGameMemory_.getGame(game.pin)
            const response = this.createArray()

            if(!gameMemory) {

                const request = moduleGameMemory_.addGameMemory(game.pin, gameId, player.playerId, response)

                if (!request) {
                    console.log('no se creo la partida')
                } else {
                    console.log(`partida generada con el socket ${socket.id}, con la respuesta ${response}`)
                    const players_ = players.getPlayers(player.hostId)
                    this.addPlayersGameCount(players_, response, game.pin, gameId)
                    let position = [
                        {
                            position1: response[0][0],
                            position2: response[0][1],
                            position3: response[0][2] 
                        },
                        {
                            position1: response[1][0],
                            position2: response[1][1],
                            position3: response[1][2] 
                        },
                        {
                            position1: response[2][0],
                            position2: response[2][1],
                            position3: response[2][2] 
                        },
                        {
                            position1: response[3][0],
                            position2: response[3][1],
                            position3: response[3][2] 
                        }
                    ]
                    

                    for (let index = 0; index < players_.length; index++) {
                        
                        if(players_[index].onGame != false) {
                            io.to(players_[index].playerId).emit('init-game-memory',position)
                        }
                        
                    }
                    
                    
                    console.log('se creo la partida')
                    this.timerViewGameMemory(io, players_)
                }

            }
        }
    }

    timerViewGameMemory(io, players) {
        let time = 15;
            
        setInterval(() => {
            if(time >= 0) {
                for (let index = 0; index < players.length; index++) {
                    
                    if(players[index].onGame != false) {
                        io.to(players[index].playerId).emit('timer-view-game',time)
                    }
                    
                }
                if(time <= 0) {
                    this.timerGameMemory(io, players)
                }
                time--;
            }
        }, 1000);
        
    }

    timerGameMemory(io, players) {
        let time = 45;
            
        setInterval(() => {
            if(time >= 0) {
                for (let index = 0; index < players.length; index++) {
                    
                    if(players[index].onGame != false) {
                        io.to(players[index].playerId).emit('timer-game-memory',time)
                    }
                    
                }
                time--;
            }
        }, 1000);
        
    }

    resultGameMemory(socket, io) {
        return (params) => {
            const player = players.getPlayer(socket.id)
            const game = games.getGame(player.hostId)
            const gameMemory = moduleGameMemory_.getGame(game.pin)
            const gamesMemory = moduleGameMemory_.getGames(game.pin)
            const response = moduleGameMemory_.addResultGameMemory(gameMemory.gameId, player.playerId, params.Items)

            if (!response) {
                console.log('no se guardo el resultado')
            } else {
                console.log(`se guarda el resultado del socket ${socket.id}`)
                const players_ = players.getPlayers(player.hostId)
                const playersResult = moduleGameMemory_.getResultGame(gameMemory.gameId)
                console.log(playersResult)
                if(gamesMemory.length == playersResult.length) {
                    for (let index = 0; index < players_.length; index++) {
                        io.to(players_[index].playerId).emit('position-game-memory', this.positionGameMemory(playersResult, gameMemory.response))
                    }
                    moduleGameMemory_.removeGame(game.pin)
                    moduleGameMemory_.removeResultGame(gameMemory.gameId)
                }

            }
        }
    }

    positionGameMemory(players, result) {
        const position = []
        players.forEach(element => {
            let player = []
            for(let row = 0; row < 4; row++) {
                let player_ = [
                    parseInt(element.response[row].position1),
                    parseInt(element.response[row].position2),
                    parseInt(element.response[row].position3)
                ]
                player.push(player_)
            }

            let points = 0
            for (let row = 0; row < players.length; row++) {
                
                for (let col = 0; col < players.length; col++) {
                    
                    if(player[row][col] == result[row][col]) {
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

        
        return this.postionNumberGameMemory(position)

    }

    postionNumberGameMemory(players) {
        let positions = []
        let position
        
        for (let index = 0; index < players.length; index++) {
            if (index > 0) {
                if(players[index-1].points == players[index].points) {
                    position = {
                        playerId: players[index].playerId,
                        points: players[index].points,
                        position: index
                    }
                } else {
                    position = {
                        playerId: players[index].playerId,
                        points: players[index].points,
                        position: index + 1
                    }
                }
            }else {
                position = {
                    playerId: players[index].playerId,
                    points: players[index].points,
                    position: 1
                }
            }
            positions.push(position)
        }

        return positions
    }

    descendingOrder(a, b) {
        return b.points - a.points
    }

    addPlayersGameCount(players, response, game, gameId) {

        for (let index = 0; index < players.length; index++) {
            let playerAdd = moduleGameMemory_.getGame(game)
            if(players[index].onGame != false && players[index].playerId != playerAdd.playerId) {
                moduleGameMemory_.addGameMemory(game, gameId, players[index].playerId, response)
            }
            
        }
        
    }

    createArray() {

        let result = []
        let number

        for (let row = 0; row < 4; row++) {
            result[row] = []
            for (let col = 0; col < 3; col++) {
                
                result[row][col] = '0'
                
            }
            
        }

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                
                number = Math.floor(Math.random() * (13 - 1)) + 1
                
                while(this.checkArray(result, number) == false ) {
                    number = Math.floor(Math.random() * (13 - 1)) + 1
                }
                
                result[row][col] = number
            }
            
        }

        return result
    
    }

    checkArray(arr, num) {

        for (let row = 0; row < 4; row++) {
            
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