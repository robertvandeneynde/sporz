function randrange(N){
    return Math.floor(Math.random() * N)
}

/*
var irandom = 0;
function randrange(N) {
    return (5 + irandom++ * 3) % N
} 
*/

function shuffled(L) {
    var C = L.concat()
    var N = C.length
    for(var i = 0; i < N; i++) {
        var n = i + randrange(N - i);
        var save = C[i]
        C[i] = C[n]
        C[n] = save
    }
    return C
}

function sorted(L, keyfunc) {
    var C = L.concat()
    C.sort(keyfunc)
    return C
}

function arrayFilled(value, N) {
    var L = new Array(N)
    for(var i = 0; i < N; i++)
        L[i] = value;
    return L
}

function sum(L){
    var s = 0
    var N = L.length
    for(var i = 0; i < N; i++)
        s += L[i]
    return s
}

function startswith(base, string) {
    return base.substr(0, string.length) == string
}

function mapfilter(L, map, filter) {
    var R = []
    var N = L.length;
    for(var i = 0; i < N; i++)
        if(filter(L[i], i, L))
            R.push(map(L[i], i, L))
    return R
}

function range(N) {
    var R = new Array(N)
    for(var i = 0; i < N; i++)
        R[i] = i
    return R
}

function contains(L, n) {
    return L.indexOf(n) != -1
}

function all(L){
    for(var i = 0; i < L.length; i++)
        if(! L[i])
            return false
    return true
}

function any(L){
    for(var i = 0; i < L.length; i++)
        if(L[i])
            return true
    return false
}

function noDuplicates(L) {
    for(var i = 0; i < L.length; i++)
        for(var j = i+1; j < L.length; j++)
            if(L[i] == L[j])
                return false
    return true
}

$(function(){
    var body = $('body')
    var self = $('<div>')
    body.append(self)
    
    var inputs;
    self.append(
        $('<div>').html('Indiquez le nom des joueurs ici et <strong>activez le son</strong> !')
    ).append(
        inputs = range(8).map(function(i){
            return $('<input class="joueur-input" type="text" />').attr('placeholder', 'Joueur ' + (i+1))
        })
    ).append(
        $("<div class=ici>").css('display', 'block').text("Ok !").click(function(){
            var players = inputs.map(function(inp){
                return inp.val()
            })
            if(! all(players)) {
                alert("Il manque des joueurs !")
            } else if(! noDuplicates(players)) {
                alert("Deux joueurs ont le même nom !")
            } else if(any(players.map(function(n){ return n == "Blanc" }))) {
                alert("Un joueur s'appelle Blanc !")
            } else {
                self.remove()
                beginGame(players)
            }
        }).click(function(){
            $('#intro').hide()
        })
    )
    
    inputs[0].focus()
    
    /*
    beginGame([
        "Genet RRR",
        "Psi",
        "MediMedi",
        "Python Hôte",
        "Hacky",
        "Terrible Mutant",
        "Spi",
        "MeduMedu",
    ]) // avec un randrange(N) = (5 + irandom++ * 3) % N, les infos correspondent   
    */
})

// TODO: rien faire
// TODO: quid du hacker qui n'a plus personne à hacker
// Les mutants peuvent tuer ET paralyser

function beginGame(joueursRaw) {
    window.onbeforeunload = function (e) {
        var message = "La partie sera perdue si vous partez !"
        e = e || window.event;
        // For IE and Firefox
        if (e) {
            e.returnValue = message;
        }

        // For Safari
        return message;
    };
    
    var J = joueursRaw.length
    
    // Example :
    // joueursRaw    = ["A", "B", "C", "D", "E", "F", "G", "H"]
    //                0    1    2    3    4    5    6    7
    var joueursRandom = shuffled(joueursRaw.map(function(j,r){ return [j,r] }))
    // joueursRandom = [] 
    var initialorder = joueursRandom.map(function(t){ return t[1]; })
    var joueurs = joueursRandom.map(function(t){ return t[0]; })
    var roles = ["Mutant de Base", "Médecin #1", "Médecin #2", "Psychologue", "Généticien", "Informaticien", "Hacker", "Espion"]
    var rolesSlug = ["mutant-de-base", "medecin-1", "medecin-2", "psychologue", "geneticien", "informaticien", "hacker", "espion"]
    var nMutants = 1
    var nMedecins = 2
    
    var genomes = ["Hôte", "Neutre", "Neutre"].concat(shuffled(["Hôte", "Résistant"].concat(arrayFilled("Neutre", J-5))))
    var etats = ["Mutant"].concat(arrayFilled("Sain", J-1))
    
    var alive = arrayFilled(true, J)
    
    var events = null;
    var events_espion = null;
    var events_hack = null;
    var paralyses = null
    var mortsAtNight = null;
    var night = 0;
    
    var printVotes = function(votes) {
        hidden_list.prepend(
            $('<div>').append(
                $('<p>' + 'Votes' + '</p>') 
            ).append(
                $('<table class=vote_table>').append(
                    sorted(
                        joueursInOrder.filter(function(i){
                            return alive[i]
                        }).concat([J]),
                        
                        function(i,j){
                            return votes[i].length > votes[j].length
                        }
                    ).map(function(i){
                        var name = i == J ? "Blanc" : joueurs[i]
                        return $('<tr>').append(
                            $('<td>').text(name)
                        ).append(
                            $('<td>').text(votes[i].map(function(j){ return joueurs[j] }).join(', '))
                        )
                    })
                )
            )
        )
    }
    
    var printAll = function(reason) {
        if(night == 0) {
            hidden.append('<p>Game not started</p>')
            return;
        }
        
        hidden_list.prepend(
            $('<div>')
            .append(
                $('<p>').text('Nuit ' + night + ' ' + reason)
            )
            .append(
                $('<table class=secret_table>')
                .append(
                    $('<tr>').append('<th>' + [
                        "Nom",
                        "Rôle",
                        "Génôme",
                        "Spore",
                        "Vie",
                        "Événements",
                        "Hack",
                        "Espion",
                    ].join('</th><th>') + '</th>')
                )
                .append(
                    joueursInOrder.map(function(i) {
                        function toUl(L) {
                            if(L.length == 0)
                                return '<ul></ul>'
                            return '<ul><li>' + L.join('</li><li>') + '</li></ul>';
                        }
                        return ('<tr><td>' + [
                            joueurs[i],
                            roles[i],
                            (genomes[i] == "Neutre" ? "<span class=default_elem>" + genomes[i] + "</span>" : genomes[i]),
                            (etats[i] == "Sain" ? "<span class=default_elem>" + etats[i] + "</span>" : etats[i]),
                            (alive[i] ? "<span class=default_elem>" + "Vivant" + "</span>" : "Mort"),
                            toUl(events[i]),
                            toUl(events_hack[i]),
                            toUl(events_espion[i]),
                        ].join('</td><td>') + '</td></tr>')
                    })
                )
            )
        )
    }
    
    /*
    var joueursInOrder = sorted(
        joueurs.map(function(joueur, i){
            return [joueur, i]
        }), function(x,y){
            return x[0] > y[0]
        }
    ).map(function(t) {
        return t[1];
    })
    */
    
    var joueursInOrder = sorted(
        range(J),
        function(i,j){
            return initialorder[i] > initialorder[j]
        }
    )
    
    var hackablePlayers = mapfilter(joueurs, function(joueur, i){
        return i
    }, function(joueur, i) {
        return startswith(roles[i], "Psychologue") ||
        startswith(roles[i], "Généticien") ||
        startswith(roles[i], "Informaticien")
        // With multiples informaciens, one has to decide if
        // - Info1 then Info2 may be hacked
        // - What happens when hacking a paralysed informaticien
    })
    
    var explicationsGenome = {
        'Neutre': "Peut être muté, puis soigné, puis muté, puis soigné... à l'infini",
        'Hôte': "Une fois muté, ne peut jamais être soigné.",
        'Résistant': "Ne peut pas être muté !",
    }
    
    function makeEmptyLists() {
        return joueurs.map(function(){
            return []
        })
    }
    
    function getNumberOfMutants() {
        return etats.filter(function(x,i){
            return alive[i] && x == "Mutant"
        }).length
    }
    
    function getNumberOfSains() {
        return etats.filter(function(x,i){
            return alive[i] && x == "Sain"
        }).length
    }
    
    var audio = new Audio()
    var theEv = null;
    function say(sentence, end) {
        printAll(sentence)
        
        audio.src = sentence
        
        // setTimeout(function(){
            // var audio = new Audio(sentence) // $('<audio>').attr('src', sentence)
            // $('body').append(audio)
            audio.currentPosition = 0
            if(theEv != null)
                audio.removeEventListener('ended', theEv)
            audio.addEventListener('ended', end)
            theEv = end
            /*audio.addEventListener('ended', function(){
                audio.remove()
            })*/
            audio.play()
        // }, 500)
    }
    
    function getListJoueurs(haveBlanc){
        if(haveBlanc == null)
            haveBlanc = false;
        return $("<div>").append(joueursInOrder.filter(function(i){
            return alive[i]
        }).concat(haveBlanc ? [J] : []).map(function(i) {
            return $("<span class='item'>").attr("data-i", i).text(joueurs[i])
        }))
    }
    
    function getListRolesHacker(exclude, haveBlanc) {
        if(haveBlanc == null)
            haveBlanc = true;
        return $('<div>').append(hackablePlayers.filter(function(i){
            return (alive[i] || contains(mortsAtNight, i)) && i != exclude
        }).concat(haveBlanc ? [J] : []).map(function(i){
            return $("<span class='item'>").attr("data-i", i).text(i == J ? "Personne" : roles[i])
        }))
    }
    
    function makeDeleteList(clickFunction, generateFunction){
        var L = generateFunction()
        L.find('.item').click(function(){
            L.remove()
            clickFunction($(this).data('i'))
        })
        return L
    }
    
    function makeListJoueurs(clickFunction) {
        return makeDeleteList(clickFunction, getListJoueurs)
    }
    
    function makeListRolesHacker(clickFunction, exclude, haveBlanc) {
        return makeDeleteList(clickFunction, function(){
            return getListRolesHacker(exclude, haveBlanc)
        })
    }
    
    function getAutopsie(m) {
        return "Mort de " + joueurs[m] + " qui était <ul><li>" + [
            roles[m],
            etats[m],
            genomes[m] + ' (' + explicationsGenome[genomes[m]] + ')',
        ].join("</li><li>") + "</li></ul>"
    }
    
    var real_body = $('body')
    var body = $('<div class=main_body>') // not the part that is hidden
    var hidden_button = $('<div class=hidden_button>').append(
        $('<span class=ici>').text('Voir les secrets ! (Cliquez 10 fois)')
    )
    var hidden = $('<div class=hidden_body>') // for the log !
    var hidden_list = $('<div>')
    
    var hide_hidden;
    hidden.append(hide_hidden = $('<p class=ici>').text("Secrets (Cliquez pour faire disparaitre)"))
    hidden.append(hidden_list)
    
    real_body.append(body)
    real_body.append(hidden_button)
    real_body.append(hidden)
    
    hidden_button.count = 0
    hidden.hide()
    
    hide_hidden.click(function(){
        hidden.hide()
        hidden_button.count = 0
    })
    
    hidden_button.click(function(){
        hidden_button.count++
        if(hidden_button.count >= 10) {
            hidden_button.count = 0
            hidden.show()
        }
    })
    
    var VOUS_ETES_PARALYSE = "Vous êtes paralysé"
    
    function depouillement(votes) {
        var next = beginOfNight
        
        var m = 0
        var maxes = [m]
        
        for(var i = 1; i < J+1; i++) {
            if(votes[i].length > votes[m].length) {
                m = i
                maxes = [m]
            } else if(votes[m].length == votes[i].length) {
                maxes.push(i)
            }
        }
        
        var div = $('<div>')
        body.append(div)
        
        function proceed() {
            var msg;
            if(m == J) {
                msg = "BLANC meurt."
            } else {
                msg = getAutopsie(m)
                alive[m] = false
            }
            
            div.empty().append(
                $('<div class=info>').append(
                    $('<div>').html(msg)
                ).append(
                    $('<div class=ici>').text('Ok')
                    .click(function(){
                        div.remove()
                        next()
                    })
                )
            )
        }
        
        printVotes(votes)
        
        div.append(
            $('<table class=vote_table>').append(
                sorted(
                    joueursInOrder.filter(function(i){
                        return alive[i]
                    }).concat([J]),
                    
                    function(i,j){
                        return votes[i].length > votes[j].length
                    }
                ).map(function(i){
                    var name = i == J ? "Blanc" : joueurs[i]
                    return $('<tr>').append(
                        $('<td>').text(name)
                    ).append(
                        $('<td>').text(votes[i].length)
                    )
                })
            )
        ).append(
            $('<div class=ici>').text('Ok')
            .click(
                function() {
                    if(maxes.length == 1) {
                        proceed() // no draw
                    } else {
                        var L;
                        div.append(
                            L = $('<div>')
                            .append(
                                $('<div>').text("Égalité, le chef choisit !")
                            )
                            .append(
                                maxes.map(function(i){
                                    return $("<div class='item'>").text(i == J ? "BLANC" : joueurs[i]).attr('data-i', i)
                                })
                            ).find('.item')
                                .click(function(){
                                    L.remove()
                                    m = $(this).data('i')
                                    proceed()
                                })
                            .end()
                        )
                    }
                }
            )
        )
    }
    
    function endOfNight() {
        say('tout-le-monde-se-reveille.mp3', function(){
            var still = range(J).filter(function(i){
                return alive[i]
            })
            
            var votes = makeEmptyLists().concat([ [] ])
            
            var mortsNuit = $('<div>');
            body.append(mortsNuit)
            
            if(mortsAtNight.length) {
                var selfMortsNuit;
                mortsNuit.append(
                    selfMortsNuit = $('<div>').append(
                        mortsAtNight.map(function(j){
                            return $('<div>').html(getAutopsie(j))
                        })
                    )
                    .append(
                        $('<div class=ici>').text('Ok !')
                        .click(function(){
                            selfMortsNuit.remove()
                        })
                    )
                )
            }
            
            var login = $('<div>')
            body.append(login)
            
            var firstTime = true;
            
            function recreateLogin() {
                if(still.length == 0) {
                    mortsNuit.remove()
                    login.remove()
                    return depouillement(votes)
                }
                
                if(! firstTime)
                    login.empty()
                firstTime = false;
                    
                login.append(
                    'Login du bureau de vote : '
                ).append(
                    makeListJoueurs(function(i){
                        var self;
                        login.empty()
                        
                        if(! contains(still, i)) {
                            login.append(
                                self = $('<div>').append(
                                    $('<div>').text("Vous êtes déjà venu !")
                                ).append(
                                    $('<div class=ici>').text('Ok')
                                    .click(function(){
                                        self.remove()
                                        recreateLogin()
                                    })
                                )
                            )
                        } else {
                            login.append(
                                $('<p>Scrutin</p>')
                            ).append(
                                [] // $('<div>').text("Ce qu'il s'est passé sur vous pendant la nuit :")
                            ).append(
                                [] // $('<div>').text(events[i])
                            ).append(
                                $('<div>').text("Voter contre...")
                            ).append(
                                makeListJoueurs(function(j){
                                    votes[j].push(i);
                                    still.splice(still.indexOf(i), 1)
                                    recreateLogin()
                                })
                            ).append(
                                $('<div class="item">').text("Blanc").click(function(){
                                    votes[J].push(i);
                                    still.splice(still.indexOf(i), 1)
                                    recreateLogin()
                                })
                            )
                            .append(
                                [] // $('<div>').text("Voter plus tard").click(recreateLogin)
                            )
                        }
                    })
                ).append(
                    $('<p>').text('Restants : ' + still.length)
                )
            }
            
            recreateLogin()
        })
    }
    
    function makeSimpleRole(i){
        var next = endOfNight
        
        if(i >= J)
            return next()
        
        if(! alive[i] && ! contains(mortsAtNight, i))
            return makeSimpleRole(i + 1)
        
        say(rolesSlug[i] + "-se-reveille.mp3", function(){
            
            function endOfMe(){
                div.remove()
                makeSimpleRole(i + 1)
            }
            
            var div = $('<div>')
            body.append(div)
            
            div.append(
                $('<div class=info>').text("Bonjour " + roles[i] + " " + joueurs[i])
            ).append(
                $('<ul class=info>').append(
                    events[i].map(function(msg){
                        return $('<li>').text(msg)
                    })
                )
            )
            
            if(! alive[i] || paralyses[i]){
                div.append(
                    $('<div class=info>').append(
                        $('<div>').text("Vous ne pouvez rien faire. Attendez un peu et cliquez sur le bouton.")
                    ).append(
                        $('<div class=ici>').text('Ok')
                        .click(function(){
                            div.remove()
                            makeSimpleRole(i+1)
                        })
                    )
                )
            } else {
                var isPsy = startswith(rolesSlug[i], "psychologue")
                var isGen = startswith(rolesSlug[i], "geneticien")
                var isInf = startswith(rolesSlug[i], "informaticien")
                var isHac = startswith(rolesSlug[i], "hacker")
                var isEsp = startswith(rolesSlug[i], "espion")
                
                var sub2;
                
                div.append(
                    $("<div class=info>").text(
                        isPsy ? "Qui voulez-vous psychanalyser ?" :
                        isGen ? "Qui voulez-vous génotyper ?" :
                        isInf ? "" :
                        isHac ? "Quel rôle voulez-vous hacker ?" :
                        isEsp ? "Qui voulez-vous espionner ?" :
                            "??"
                    )
                ).append(
                    (isPsy || isGen || isEsp) ? makeListJoueurs(function(j){
                        div.empty()
                        
                        var msg = joueurs[j] + (
                            isPsy ? " est actuellement " + etats[j].toUpperCase() :
                            isGen ? " est de génôme " + genomes[j].toUpperCase() + ' (' + explicationsGenome[genomes[j]] + ')' : 
                            isEsp ? " a subi " + events_espion[j].length + " opération(s) cette nuit" + 
                            "<ul>" + events_espion[j].map(function(x){
                                return "<li>" + x + "</li>"
                            }).join('') + "</ul>"
                            : ''
                        )
                        
                        div.append(
                            $('<div class=info>').append(
                                $('<div>').html(msg)
                            ).append(
                                $('<div class=ici>').text('Ok')
                                .click(endOfMe)
                            )
                        )
                        
                        events_espion[j].push("Analysé par " + roles[i])
                        events_hack[i].push(msg)
                        
                    }) : isInf ? function(){
                        var msg = "Nombre de mutants : " + getNumberOfMutants()
                        events_hack[i].push(msg)
                        return $('<div class=info>').append(
                            $('<div>').text(msg)
                        ).append(
                            $('<div class=ici>').text('Ok')
                            .click(endOfMe)
                        )
                    }() : isHac ? makeListRolesHacker(function(j){
                        div.empty().append(
                            $('<div class=info>').click(endOfMe).append(
                                $('<div>').html(
                                    "ls /home/"
                                    + (j == J ? '---' : roles[j])
                                    + " <br/>"
                                    + "<div class=info>"
                                        + (j != J && events_hack[j].length ? events_hack[j] : '404 : Not Found')
                                    + "</div>"
                                )
                            ).append(
                                $('<div class=ici>').text('Ok')
                            )
                        )
                    }) : []
                )
            }
        })
    }
    
    function endOfMedecins() {
        function next(){
            makeSimpleRole(nMutants + nMedecins)
        }
        
        var i = rolesSlug.indexOf("mutant-de-base")
        
        if(! alive[i] && ! contains(mortsAtNight, i))
            return next()
        
        say("mutant-de-base-se-reveille.mp3", function(){
            var div = $('<div class=info>')
            body.append(div)
            
            div.append(
                $('<div class=info>').text("Bonjour mutant de base")
            ).append(
                events[i].length ? events[i].map(function(msg){
                    return $('<div class=info>').text(msg)
                }) : $('<div class=info>').text("Rien ne s'est passé")
            ).append(
                $('<div class=ici>').text('Ok')
            ).click(function(){
                div.remove()
                next()
            })
        })
    }
    
    function medecinsTogether() {
        var next = endOfMedecins
        
        var anyAlive = false
        for(var n = 1; n <= 2; n++) {
            var i = rolesSlug.indexOf("medecin-" + n)
            if(alive[i] && ! events[i].length) {
                anyAlive = true
            }
        }
        
        // if(! anyAlive) {
        //     say('medecins-se-reveillent-pause-{}.mp3'.replace('{}', 1 + randrange(4)), next)
        // } else {
            say("medecins-se-reveillent.mp3", function(){
                if(! anyAlive) {
                    setTimeout(next, 10000 + Math.random() * 10000) // allowed for mobile too
                    return;
                }
                
                var div = $('<div>')
                body.append(div)
                
                div.append(
                    $('<div>').text('Bonjour médecins, que voulez vous faire ?')
                )
                .append(
                    $('<div class="item">').text('Soigner').click(function(){
                        div.empty()
                        var stillSoins = 0
                        var soins = []
                        for(var n = 1; n <= 2; n++){
                            var i = rolesSlug.indexOf("medecin-" + n)
                            if(alive[i] && ! events[i].length) {
                                stillSoins++
                                div.append(
                                    $('<div>').text("Cible de soin")
                                ).append(
                                    makeListJoueurs(function(j){
                                        soins.push(j)
                                        
                                        if(etats[j] == "Mutant") {
                                            if(genomes[j] == "Hôte") {
                                                events[j].push("On a essayé de vous soigner mais ça n'a pas marché car vous êtes HÔTE")
                                            } else {
                                                events[j].push("Vous êtes soigné ! Vous êtes SAIN à nouveau !")
                                                etats[j] = "Sain"
                                            }
                                        } else {
                                            events[j].push("On a essayé de vous soigner mais vous êtes déjà sain...")
                                        }
                                        
                                        events_espion[j].push("Soigné")
                                        
                                        if(--stillSoins == 0) {
                                            div.remove()
                                            var wait = $('<div class=info>')
                                            body.append(wait)
                                            wait.append(
                                                $('<div>').text('Vos cibles de soin :')
                                            ).append(
                                                $('<ul>').append(
                                                    soins.map(function(x){
                                                        return $('<li>').text(joueurs[x])
                                                    })
                                                )
                                            ).append(
                                                $('<div class=ici>').text("Ok")
                                                .click(function(){
                                                    wait.remove()
                                                    next()
                                                })
                                            )
                                        }
                                    })
                                )
                            }
                        }
                    })
                )
                .append(
                    $('<div class="item">').text('Tuer').click(function(){
                        div.empty()
                        div.append($('<div>').text("Cible de meutre")).append(
                            makeListJoueurs(function(j){
                                alive[j] = false
                                events[j].push("Vous êtes MORT")
                                mortsAtNight.push(j)
                                
                                div.empty()
                                say("medecins-ont-tue.mp3", function(){
                                    div.append(
                                        $('<div class=info>').append(
                                            $('<div>').text('Mort de ' + joueurs[j] + " !")
                                        ).append(
                                            $('<div class=ici>').text('Ok')
                                            .click(function(){
                                                div.remove()
                                                next()
                                            })
                                        )
                                    )
                                })
                            })
                        )
                    })
                )
                
            })
        // }
    }
    
    function endOfMutants() {
        var next = medecinsTogether
        
        function makeMedecin(n) {
            if(n > nMedecins)
                return next()
            
            var i = rolesSlug.indexOf("medecin-" + n)
            
            if(! alive[i] && ! contains(mortsAtNight, i)) {
                makeMedecin(n + 1)
            } else {
                say("medecin-" + n + "-se-reveille.mp3", function(){
                    var self;
                    body.append(
                        self = $('<div>').append(
                            $('<div>').text("Bonjour Médecin #" + n + " " + joueurs[i])
                        ).append(
                            $('<div class=info>').text(
                                events[i].length ? [] : 'Aucun événement cette nuit'
                            )
                        ).append(
                            events[i].length ? $('<ul>').append(
                                events[i].map(function(msg){
                                    return $('<li class=info>').text(msg)
                                })
                            ) : []
                        ).append(
                            $('<div class=info>').text(
                                events[i].length ?
                                    "Vous ne vous réveillerez donc pas avec votre autre médécin." :
                                    "Vous vous réveillerez donc normalement"
                            )
                        ).append(
                            $('<div class=ici>').text('Ok')
                            .click(function(){
                                self.remove()
                                makeMedecin(n + 1)
                            })
                        )
                    )
                })
            }
        }
        
        makeMedecin(1)
    }
    
    function beginOfNight() {
        var next = endOfMutants
        night++;
        
        events = makeEmptyLists()
        events_hack = makeEmptyLists()
        events_espion = makeEmptyLists()
        paralyses = arrayFilled(false, J)
        mortsAtNight = []
        
        if(getNumberOfMutants() == 0) {
            say("fin-de-partie-sains.mp3", function(){})
            return
        } 
        if (getNumberOfSains() == 0) {
            say("fin-de-partie-mutants.mp3", function(){})
            return
        }
        
        // say("tout-le-monde-s-endort.mp3", function(){
        say("mutants-se-reveillent.mp3", function(){
            var div = $('<div>');
            body.append(div)
            
            div.append(
                $('<div>').text("Bonjour mutants, que voulez-vous faire ?")
            ).append(
                $('<div class="item">').text("Muter et Paralyser").click(function(){
                    div.empty()
                    
                    var par = -1, mut = -1;
                    
                    function checkNext() {
                        if(par != -1 && mut != -1) {
                            // apply mutation
                            if(genomes[mut] != "Résistant") {
                                events[mut].push("Vous êtes maintenant MUTANT")
                                etats[mut] = "Mutant"
                            } else {
                                events[mut].push("On a essayé de vous muter mais cela n'a pas marché car vous êtes RÉSISTANT")
                            }
                            // apply paralysis
                            events[par].push("Vous êtes paralysé")
                            paralyses[par] = true
                            
                            // record mutation
                            events_espion[mut].push("Muté")
                            // record paralysis
                            events_espion[par].push("Paralysé")
                            
                            div.remove()
                            
                            var wait = $('<div class=info>').append(
                                $('<div>').text('Vos actions :')
                            ).append(
                                $('<ul>').append(
                                    $('<li>').text(joueurs[mut] + " est votre cible de mutation.")
                                ).append(
                                    $('<li>').text(joueurs[par] + " est paralysé")
                                )
                            ).append(
                                $('<div class=ici>').text('Ok')
                            )
                            
                            body.append(wait)
                            
                            wait.click(function(){
                                wait.remove()
                                next()
                            })
                        }
                    }
                    
                    div.append(
                        $('<div>').text('Cible de mutation :')
                    ).append(
                        makeListJoueurs(function(m){
                            mut = m
                            checkNext()
                        })
                    ).append(
                        $('<div>').text('Cible de paralysie :')
                    ).append(
                        makeListJoueurs(function(p){
                            par = p
                            checkNext()
                        })
                    )
                })
            ).append(
                $('<div class="item">').text("Tuer et Paralyser").click(function(){
                    div.empty()
                    
                    var par = -1, tue = -1;
                    
                    function checkNext() {
                        if(par != -1 && tue != -1) {
                            // apply death
                            alive[tue] = false
                            events[tue].push("Vous êtes MORT")
                            mortsAtNight.push(tue)
                            
                            // apply paralysis
                            events[par].push("Vous êtes paralysé")
                            paralyses[par] = true
                            
                            // record paralysis
                            events_espion[par].push("Paralysé")
                            
                            div.remove()
                            
                            var wait = $('<div class=info>').append(
                                $('<div>').text('Vos actions :')
                            ).append(
                                $('<ul>').append(
                                    $('<li>').text(joueurs[tue] + " est tué")
                                ).append(
                                    $('<li>').text(joueurs[par] + " est paralysé")
                                )
                            ).append(
                                $('<div class=ici>').text('Ok')
                            )
                            
                            body.append(wait)
                            
                            wait.click(function(){
                                wait.remove()
                                
                                say("mutants-ont-tue.mp3", function(){
                                    var infodeath;
                                    body.append(
                                        infodeath = $('<div class=info>').append(
                                            $('<div>').text("Mort de " + joueurs[tue] + " !")
                                        ).append(
                                            $('<div class=ici>').text('Ok')
                                            .click(function(){
                                                infodeath.remove();
                                                div.remove()
                                                next()
                                            })
                                        )
                                    )
                                })
                            })
                        }
                    }
                    
                    div.append(
                        $('<div>').text('Cible de meurtre :')
                    ).append(
                        makeListJoueurs(function(m){
                            tue = m
                            checkNext()
                        })
                    ).append(
                        $('<div>').text('Cible de paralysie :')
                    ).append(
                        makeListJoueurs(function(p){
                            par = p
                            checkNext()
                        })
                    )
                    
                    /*div.append(
                        makeListJoueurs(function(j){
                            alive[j] = false
                            events[j].push("Vous êtes MORT")
                            mortsAtNight.push(j)
                            
                            div.empty()
                            say("mutants-ont-tue.mp3", function(){
                                div.append(
                                    $('<div class=info>').append(
                                        $('<div>').text("Mort de " + joueurs[j] + " !")
                                    ).append(
                                        $('<div class=ici>').text('Ok')
                                    ).click(function(){
                                        div.remove()
                                        next()
                                    })
                                )
                            })
                        })
                    )*/
                })
            )
        })
    }
    
    function electionChef(){
        var next = beginOfNight
        
        var self;
        body.append(
            self = $('<div class=info>')
            .append(
                $('<div>').text("Choisissez un chef et puis GO !")
            )
            .append(
                $('<div class=ici>').text('Ok')
                .click(function(){
                    self.remove()
                    next()
                })
            )
        )
    }
    
    function beginOfGame() {
        
        var next = electionChef
        
        // return next()
        
        var login = $('<div>');
        body.append(login)
        
        var still = range(J)
        
        function recreateLogin() {
            if(still.length == 0) {
                login.remove()
                next()
                return
            }
            
            login.empty().append(
                "Login pour informations :"
            ).append(
                makeListJoueurs(function(i){
                    var self;
                    login.empty()
                    
                    if(! contains(still, i)) {
                        login.append(
                            self = $('<div class=info>').append(
                                $('<div>').text("Vous êtes déjà venu !")
                            ).append(
                                $('<div class=ici>').text('Ok')
                                .click(function(){
                                    self.remove()
                                    recreateLogin()
                                })
                            )
                        )
                    } else {
                        still.splice(still.indexOf(i), 1)
                        
                        login.append(
                            $('<div class=info>')
                            .append(
                                $('<div>').text("Bonjour " + joueurs[i])
                            ).append(
                                $('<div class=info>').text("Vous êtes " + roles[i])
                            )
                            .append(
                                ! startswith(rolesSlug[i], "medecin") ? [] :
                                $('<div class=info>').text("Et l'autre médecin est " + joueurs.filter(function(name, j){
                                    return j != i && startswith(rolesSlug[j], "medecin")
                                }))
                            )
                            .append(
                                $('<div class=ici>').text('Ok')
                                .click(recreateLogin)
                            )
                        )
                        
                    }
                })
            )
        }
        
        recreateLogin()
    }
    
    beginOfGame()
}