class moduleGame {
    constructor () {
        this.games = [];
    }
    addGame(pin, hostId, boardLenght){
        var ballots = new Array(boardLenght);
        var activeBallots = new Array(boardLenght);
        var active = 1;
        var intervalIdCB;
        var currPosToInit = 0;
        var currTurn = 0;
        var onTurn = 1;
        for (var i = 0; i < boardLenght; i++) 
        {
            activeBallots[i] = 0;
        }
        var game = {pin, hostId, boardLenght, activeBallots, ballots, intervalIdCB,currPosToInit,currTurn,onTurn};
        this.games.push(game);
        return game;
    }
    removeGame(hostId){
        var game = this.getGame(hostId);
        
        if(game){
            this.games = this.games.filter((game) => game.hostId !== hostId);
        }
        return game;
    }
    getGame(hostId){
        return this.games.filter((game) => game.hostId === hostId)[0]
    }
}
const games = new moduleGame()
module.exports = {games};