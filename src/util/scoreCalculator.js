const activity = require('./activity');
const knex = require('../config/db.config');
const axios = require('axios');

class ScoreCalculator {

    frequencyOption(option, questionValue, reversed = false) {

        const alternativeValue = questionValue / 5;

        switch (option) {
            case 'sempre':
                return (reversed ? (alternativeValue * 5) : (alternativeValue * 1));
            case 'frequentemente':
                return (reversed ? (alternativeValue * 4) : (alternativeValue * 2));
            case 'às vezes':
                return alternativeValue * 3;
            case 'quase nunca':
                return (reversed ? (alternativeValue * 2) : (alternativeValue * 4));
            case 'nunca':
                return (reversed ? (alternativeValue * 1) : (alternativeValue * 5));
            default:
                break;
        }
    }

    ternaryOption(option, reversed = false) {

        switch (option) {
            case 'sim':
                return (reversed ? 25 : 8.33);
            case 'não':
                return (reversed ? 8.33 : 25);
            case 'não sei dizer':
                return 16.66;
            default:
                break;
        }
    }

    itemQuantity(option, questionValue, reversed = false) {

        const alternativeValue = questionValue / 4;

        switch (option) {

            case '0':
                return (reversed ? alternativeValue * 4 : alternativeValue * 1);
            case '1':
                return (reversed ? alternativeValue * 3 : alternativeValue * 2);
            case '2':
                return (reversed ? alternativeValue * 2 : alternativeValue * 3);
            case '3':
                return (reversed ? alternativeValue * 1 : alternativeValue * 4);
        }

    }

    somaPontos(obj) {
        let soma = 0;

        for (const el in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, el)) {
                soma += parseFloat(obj[el]);
            }
        }

        return soma;
    }

    async getUserActivity(userGuid, gameId) {

        const guid = (userGuid).replace(/-(?!>)/g, '');

        const couchUrl = process.env.COUCH_URL + `${guid}/_find`

        const activityId = await knex('activity').select('activity_content')
            .where('id_activity', activity[gameId])
            .catch(error => {
                console.log(error)
                res.status(500).end()
            })

        const result = await axios.post(couchUrl, {
            selector: {
                game_id: ((activityId[0].activity_content).content_identifier).replace(/-(?!>)/g, '')
            }
        }, {
            auth: {
                username: 'root',
                password: 'mvLzHv-4!9r6h*3P'
            }
        })

        return result.data.docs;
    }

    async calculateScore(dataArr) {

        let resultArr = [];
        let somaPontuacao = null;

        for(let data of dataArr) {

            const residents = data.interview_content.residents;
            const notas = data.interview_content.interview.notas;
            const respostas = data.interview_content.interview.respostas;

            let rendaTotal = 0;
            let pontos_renda = 62.5;

            residents.forEach((resident) => {
                rendaTotal += Number(resident.renda) * 1000;
            });

            const rendaPerCapta = rendaTotal / residents.length;

            if(rendaPerCapta > 4000) {
                return 0;
            }

            if(rendaPerCapta <= 3000) {
                pontos_renda = 125;
            }

            if(rendaPerCapta <= 2000) {
                pontos_renda = 187.5;
            }

            if(rendaPerCapta <= 1000) {
                pontos_renda = 250;
            }

            const pontosRedacao = Number(data.historical_organization) * 1.25 +
                Number(data.job_focus_score) * 1.25 +
                Number(data.persistence_score) * 1.25 +
                Number(data.problem_resolution_score) * 1.25;

            const [raciLogico] = await this.getUserActivity(data.guid, 'raciocinio_logico');
            const [atualidades] = await this.getUserActivity(data.guid, 'atualidades');
            const [mercadoTrabalho] = await this.getUserActivity(data.guid, 'mercado_de_trabalho');

            const pontosMultEscolha = raciLogico.numCorrectAns * 4.167 +
                atualidades.numCorrectAns * 4.167 +
                mercadoTrabalho.numCorrectAns * 4.167;

            const pontosEstudoCaso = Number(data.case_study_score) * 5;

            let pontuacao = {

                desafios: (Number(notas[0]) * 3.75),
                argumentacao: 22.5 - (3.75 * Number(notas[1])),
                objetivo: (Number(notas[2]) * 3.75),
                potencilidades: 22.5 - (3.75 * Number(notas[3])),
                lazer: 22.5 - (3.75 * Number(notas[4])),
                organizacao: 22.5 - (3.75 * Number(notas[5])),
                vulnerabilidade: (Number(notas[6]) * 3.75),
                autoEstima: 22.5 - (3.75 * Number(notas[7])),
                satisfeito: this.frequencyOption(respostas[8], 25),
                estressado: this.frequencyOption(respostas[9], 25, true),
                triste: this.frequencyOption(respostas[10], 25, true),
                ansioso: this.frequencyOption(respostas[11], 25, true),
                doenca_psiq: this.ternaryOption(respostas[12], true),
                doenca_familia: this.ternaryOption(respostas[13], true),
                filhos: this.ternaryOption(respostas[15]),
                vinculo_familiar: this.frequencyOption(respostas[19], 15),
                amparo_familiar: this.frequencyOption(respostas[20], 15),
                vinculo_amizades: this.frequencyOption(respostas[21], 15),
                tarefas_domesticas: this.frequencyOption(respostas[22], 15, true),
                alimentacao: this.frequencyOption(respostas[23], 15),
                vulnerabilidade_social: this.frequencyOption(respostas[24], 15, true),
                geladeira: this.itemQuantity(respostas[30], 15, true),
                moradores_comodo: (Number(respostas[43]) >= 3 ? 15 : 7.5),
                relatorio_social: (Number(respostas[44]) * 10),
                relatorio_psicologico: (Number(respostas[45]) * 10),
                pontos_renda,
                pontosRedacao,
                pontosEstudoCaso,
                pontosMultEscolha
            }

            somaPontuacao = Number(this.somaPontos(pontuacao).toFixed(2));
            if(isNaN(somaPontuacao)) {

                resultArr.push({
                    id: data.id_user,
                    score: null
                });

            } else {

                resultArr.push({
                    id: data.id_user,
                    score: somaPontuacao
                });

            }

        }

        return resultArr;

    }
}

module.exports = new ScoreCalculator();
