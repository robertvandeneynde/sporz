function randrange(N){
    return Math.floor(Math.random() * N)
}

/* var irandom = 0;
function randrange(N) {
    return (5 + irandom++ * 3) % N
} */

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

/**
 * Python: [value] * N
 */
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

const tr_base = {
    "blanc": ["Blanc", "Dummy"],
    "personne": ["Personne", "Nobody"],
    "vous_etes_paralyse": ["Vous êtes paralysé", "You are paralyzed"],
    "neutre": ["Neutre", "Neutral"],
    "hôte": ["Hôte", "Host"],
    "résistant": ["Résistant", "Resistant"],
    "sain": ["Sain", "Sane"],
    "mutant": ["Mutant", "Mutant"],
    "muté": ["Muté", "Mutated"],
    "paralysé": ["Paralysé", "Paralysed"],
}

var tr = (function(){ // will vary in first menu only
    var D = {langid: 0}
    for(var k in tr_base)
        D[k] = tr_base[k][0]
    return D
})() // should use a ES6 Proxy to throw an error when not in dict

function lang(/* arguments... */) {
    return arguments[tr.langid] || arguments[0]
}

function mp3lang(basename) {
    return basename + '.' + lang('fr', 'en') + '.mp3'
}

$(function(){
    var body = $('body')
    
    function refreshMenu() {
        var self = $('<div>')
        body.empty().append(self)
        
        var config = {
            traitreRole: true,
        }
        
        var inputs, Joueur;
        self.append(
            $('<div class=ici>').css('font-variant', 'small-caps').html(lang('English', 'French')).click(function(){
                tr.langid = (tr.langid + 1) % 2
                for(var k in tr_base)
                    tr[k] = tr_base[k][tr.langid]
                refreshMenu()
            })
        ).append(
            $('<p>').html(lang('Indiquez le nom des joueurs ici et <strong>activez le son</strong> !', 'Write players name in here and <strong>turn on the volume</strong>!'))
        ).append(
            inputs = range(8).map(Joueur = function(i){
                return $('<input class="joueur-input" type="text" />').attr('placeholder', lang('Joueur', 'Player') + ' ' + (i+1))
            })
        ).append(
            $('<p>').append(
                $('<label>').append(
                    $('<input type=checkbox checked />').click(function(){
                        config.traitreRole = this.checked
                    })
                ).append(
                    $('<span>').text(lang('Rajouter un traître comme rôle', 'Add a Traitor as a role'))
                )
            )   
        ).append(
            $("<div class=ici>").css('display', 'block').text('+').click(function(){
                var n = Joueur(inputs.length)
                n.insertAfter(inputs[inputs.length-1])
                inputs.push(n)
            })
        ).append(
            $("<div class=ici>").css('display', 'block').text('−').click(function(){
                if(inputs.length > 8) {
                    inputs.pop().remove()
                } else {
                    alert(lang("8 est le minimum", "8 is the minimum"))
                }
            })
        ).append(
            $("<div class=ici>").css('display', 'block').text("Ok !").click(function(){
                var players = inputs.map(function(inp){
                    return inp.val()
                })
                if(! all(players)) {
                    alert(lang("Il manque des joueurs !", "Missing players !"))
                } else if(! noDuplicates(players.map(function(x){ return x.toLowerCase() }))) {
                    alert(lang("Deux joueurs ont le même nom !", "Two players have the same name !"))
                } else if(any(players.map(function(n){ return n == tr.blanc }))) {
                    alert(lang("Un joueur s'appelle Blanc !", "One player is called Dummy!"))
                } else {
                    self.remove()
                    beginGame(players, config)
                }
            }).click(function(){
                $('#intro').hide()
            })
        )
        
        inputs[0].focus()
    }
    
    refreshMenu()
    
    /* beginGame([
        "Genet RRR",
        "Psi",
        "MediMedi",
        "Python Hôte",
        "Hacky",
        "Terrible Mutant",
        "Spi",
        "MeduMedu",
    ], config) */ // avec un randrange(N) = (5 + irandom++ * 3) % N, les infos correspondent   
})

// TODO: rien faire
// TODO: quid du hacker qui n'a plus personne à hacker
// Les mutants peuvent tuer ET paralyser

function beginGame(joueursRaw, config) {
    config = config || {}
    config.traitreRole = config.traitreRole == null ? true : config.traitreRole
    
    window.onbeforeunload = function (e) {
        var message = lang("La partie sera perdue si vous partez !", "The game will be lost if you leave!")
        e = e || window.event;
        // For IE and Firefox
        if (e) {
            e.returnValue = message;
        }

        // For Safari
        return message;
    };
    
    var J = joueursRaw.length
    var nMutants = 1
    var nMedecins = 2
    var nTraitre = config.traitreRole ? Math.min(J-8, 1) : 0
    var nAstro = J - 8 - nTraitre
    
    // Example :
    // joueursRaw    = ["A", "B", "C", "D", "E", "F", "G", "H"]
    //                   0    1    2    3    4    5    6    7
    var joueursRandom = shuffled(joueursRaw.map(function(j,r){ return [j,r] }))
    // joueursRandom = [] 
    var initialorder = joueursRandom.map(function(t){ return t[1]; })
    var joueurs = joueursRandom.map(function(t){ return t[0]; })
    var roles = [
        lang("Mutant de Base", 'Base Mutant'),
        lang("Médecin #1", "Doctor #1"),
        lang("Médecin #2", "Doctor #2"),
        lang("Psychologue", "Psychologist"),
        lang("Généticien", "Genetician"),
        lang("Informaticien", "Programmer"),
        lang("Hacker"),
        lang("Espion", "Spy")
    ].concat(
        range(nTraitre).map(function(j){
            return lang('Traître', 'Traitor') + (nTraitre <= 1 ? '' : ' #' + (j+1))
        })
    ).concat(
        range(nAstro).map(function(j){
            return lang('Astronaute', 'Astronaut') + (nAstro <= 1 ? '' : ' #' + (j+1))
        })
    )
    
    var rolesSlug = [
        "mutant-de-base", "medecin-1", "medecin-2", "psychologue", "geneticien", "informaticien", "hacker", "espion"
    ].concat(
        range(nTraitre).map(function(j){
            return 'traitre' + (nTraitre <= 1 ? '' : '-' + (j+1))
        })
    ).concat(
        range(nAstro).map(function(j){
            return 'astronaute' + (nAstro <= 1 ? '' : '-' + (j+1))
        })
    )
    
    var genomes = [tr.hôte, tr.neutre, tr.neutre].concat(shuffled([tr.hôte, tr.résistant].concat(arrayFilled(tr.neutre, J-5))))
    var etats = [tr.mutant].concat(arrayFilled(tr.sain, J-1))
    
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
        // if(night == 0) {
        //     hidden.append('<p>Game not started</p>')
        //     return;
        // }
        
        hidden_list.prepend(
            $('<div>')
            .append(
                $('<p>').text(lang('Nuit', 'Night') + ' ' + night + ' ' + reason)
            )
            .append(
                $('<table class=secret_table>')
                .append(
                    $('<tr>').append('<th>' + [
                        lang("Nom", "Name"),
                        lang("Rôle", "Role"),
                        lang("Génôme", "Genome"),
                        lang("Spore", "Spore"),
                        lang("Vie", "Alive"),
                        lang("Événements", "Events"),
                        lang("Hack", "Hack"),
                        lang("Espion", "Spy"),
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
                            (genomes[i] == tr.neutre ? "<span class=default_elem>" + genomes[i] + "</span>" : genomes[i]),
                            (etats[i] == tr.sain ? "<span class=default_elem>" + etats[i] + "</span>" : etats[i]),
                            (alive[i] ? "<span class=default_elem>" + lang("Vivant", "Alive") + "</span>" : lang("Mort", "Dead")),
                            night == 0 ? '' : toUl(events[i]),
                            night == 0 ? '' : toUl(events_hack[i]),
                            night == 0 ? '' : toUl(events_espion[i]),
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
        return startswith(rolesSlug[i], "psychologue") ||
        startswith(rolesSlug[i], "geneticien") ||
        startswith(rolesSlug[i], "informaticien")
        // With multiples informaciens, one has to decide if
        // - Info1 then Info2 may be hacked
        // - What happens when hacking a paralysed informaticien -> TODO
    })
    
    var explicationsGenome = {}
    explicationsGenome[tr.neutre] = lang("Peut être muté, puis soigné, puis muté, puis soigné... à l'infini", "Can be mutated, then healed, then mutated, then healed... to infinite and beyond")
    explicationsGenome[tr.hôte] = lang("Une fois muté, ne peut jamais être soigné.", "Once mutated, can never be healed.")
    explicationsGenome[tr.résistant] = lang("Ne peut pas être muté !", "Can't be mutated!")
    
    function makeEmptyLists() {
        return joueurs.map(function(){
            return []
        })
    }
    
    function getNumberOfMutants() {
        return etats.filter(function(x,i){
            return alive[i] && x == tr.mutant
        }).length
    }
    
    function getNumberOfSains() {
        return etats.filter(function(x,i){
            return alive[i] && x == tr.sain
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
            return $("<span class='item'>").attr("data-i", i).text(joueurs[i] || tr.blanc)
        }))
    }
    
    function getListRolesHacker(exclude, haveBlanc) {
        if(haveBlanc == null)
            haveBlanc = true;
        return $('<div>').append(hackablePlayers.filter(function(i){
            return (alive[i] || contains(mortsAtNight, i)) && i != exclude
        }).concat(haveBlanc ? [J] : []).map(function(i){
            return $("<span class='item'>").attr("data-i", i).text(roles[i] || tr.personne) // (i == J ? "Personne" : roles[i])
        }))
    }
    
    function getListYesNo() {
        return $("<div>").append([lang("Oui", "Yes"), lang("Non", "No")].map(function(txt, i) {
            return $("<span class='item'>").attr("data-i", i).text(txt)
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
    
    function makeYesNoList(clickFunction) {
        return makeDeleteList(clickFunction, getListYesNo)
    }
    
    function makeListJoueursBlanc(clickFunction) {
        return makeDeleteList(clickFunction, function(){
            return getListJoueurs(true)
        })
    }
    
    function makeListRolesHacker(clickFunction, exclude, haveBlanc) {
        return makeDeleteList(clickFunction, function(){
            return getListRolesHacker(exclude, haveBlanc)
        })
    }
    
    function getAutopsie(m) {
        return lang("Mort de {} qui était", "{}'s death who was").replace('{}', joueurs[m]) + ' ' + "<ul><li>" + [
            roles[m],
            etats[m],
            genomes[m] + ' (' + explicationsGenome[genomes[m]] + ')',
        ].join("</li><li>") + "</li></ul>"
    }
    
    // GUI
    var real_body = $('body')
    var body = $('<div class=main_body>') // not the part that is hidden
    var hidden_button = $('<div class=hidden_button>').append(
        $('<span class=ici>').text(lang('Voir les secrets ! (Cliquez 10 fois)', 'See secrets! (Click 10 times)'))
    )
    var hidden = $('<div class=hidden_body>') // for the log !
    var hidden_list = $('<div>')
    
    var hide_hidden;
    hidden.append(hide_hidden = $('<p class=ici>').text(lang("Secrets (Cliquez pour faire disparaitre)", 'Secrets (Click to make them dissapear')))
    hidden.append(hidden_list)
    
    real_body.append([body, hidden_button, hidden])
    
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
    
    printAll(lang('Début', 'Begin'))
    
    // STATES
    
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
                msg = tr.blanc.toUpperCase() + ' ' + lang("meurt", "dies") + "."
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
                    var name = i == J ? tr.blanc : joueurs[i]
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
                                $('<div>').text(lang("Égalité, le chef choisit !", "Draw, chief chooses!"))
                            )
                            .append(
                                maxes.map(function(i){
                                    return $("<div class='item'>").text(i == J ? tr.blanc : joueurs[i]).attr('data-i', i)
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
        say(mp3lang('tout-le-monde-se-reveille'), function(){
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
                                    $('<div>').text(lang("Vous êtes déjà venu !", "You already came!"))
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
                                $('<p>').text(lang('Scrutin', 'Vote'))
                            ).append(
                                [] // $('<div>').text("Ce qu'il s'est passé sur vous pendant la nuit :")
                            ).append(
                                [] // $('<div>').text(events[i])
                            ).append(
                                $('<div>').text(lang("Voter contre...", "Vote against..."))
                            ).append(
                                makeListJoueurs(function(j){
                                    votes[j].push(i);
                                    still.splice(still.indexOf(i), 1)
                                    recreateLogin()
                                })
                            ).append(
                                $('<div class="item">').text(tr.blanc).click(function(){
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
                    $('<p>').text(lang('Restants :', "Remaining:") + ' ' + still.length)
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
        // if(startswith(rolesSlug[i], 'astronaute') || startswith(rolesSlug[i], 'traitre'))
        
        say(mp3lang(rolesSlug[i] + "-se-reveille"), function(){
            
            function endOfMe(){
                div.remove()
                makeSimpleRole(i + 1)
            }
            
            var div = $('<div>')
            body.append(div)
            
            div.append(
                $('<div class=info>').text(lang("Bonjour", "Hello") + ' ' + roles[i] + ' ' + joueurs[i])
            ).append(
                $('<ul class=info>').append(
                    events[i].length ? events[i].map(function(msg){
                        return $('<li>').text(msg)
                    }) : $('<li>').text(lang("Rien ne s'est passé", "Nothing happened"))
                )
            )
            
            if(/^astronaute|^traitre/.exec(rolesSlug[i]) || ! alive[i] || paralyses[i]){
                div.append(
                    $('<div class=info>').append(
                        $('<div>').text(
                            /^astronaute|^traitre/.exec(rolesSlug[i])
                            ? lang("Vous ne pouvez rien faire. Cliquez sur le bouton.", "You can't do anything. Click the button.")
                            : lang("Vous ne pouvez rien faire. Attendez un peu et cliquez sur le bouton.", "You can't do anything. Wait a bit then click the button.")
                        )
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
                        isPsy ? lang("Qui voulez-vous psychanalyser ?", "Who do you want psychanalyse?") :
                        isGen ? lang("Qui voulez-vous génotyper ?", "Who do you want to genotype?") :
                        isInf ? lang("Voulez-vous lire votre info ?", "Do you want to read your info?") :
                        isHac ? lang("Quel rôle voulez-vous hacker ?", "Which role do you want to hack?") :
                        isEsp ? lang("Qui voulez-vous espionner ?", "Who do you want to spy?") :
                            "??"
                    )
                ).append(
                    (isPsy || isGen || isEsp) ? makeListJoueursBlanc(function(j){
                        div.empty()
                        
                        var msg = j == J ? '' : joueurs[j] + (
                            isPsy ? ' ' + lang('est actuellement', 'is currently') + ' ' + etats[j].toUpperCase() :
                            isGen ? ' ' + lang('est de génôme', 'has genome') + ' ' + genomes[j].toUpperCase() + ' (' + explicationsGenome[genomes[j]] + ')' : 
                            isEsp ? ' ' + lang("a subi", 'suffered') + ' ' + events_espion[j].length + ' ' + lang('opération(s) cette nuit', 'operation(s) this night') + 
                            "<ul>" + events_espion[j].map(function(x){
                                return "<li>" + x + "</li>"
                            }).join('') + "</ul>"
                            : ''
                        )
                        
                        div.append(
                            $('<div class=info>').append(
                                $('<div>').html(j == J ? lang('Vous avez choisi de ne choisir personne, vous ne serez donc pas hackable.', 'You chose to choose no one, therefore you will not be hackable.') : msg)
                            ).append(
                                $('<div class=ici>').text('Ok')
                                .click(endOfMe)
                            )
                        )
                        
                        if(j != J) {
                            events_espion[j].push(lang("Analysé par", 'Analyzed by') + ' ' + roles[i])
                            events_hack[i].push(msg)
                        }

                    }) : isInf ? makeYesNoList(function(j){
                        div.empty()
                        
                        var did_say_yes = !j
                        
                        var msg = lang("Nombre de mutants :", 'Number of mutants :') + ' ' + getNumberOfMutants()
                        
                        div.append(
                            $('<div class=info>').append(
                                $('<div>').text(did_say_yes ? msg : lang("Information non downloadée", "Information non fetched"))
                            ).append(
                                $('<div class=ici>').text('Ok')
                                .click(endOfMe)
                            )
                        )
                        
                        if(did_say_yes) {
                            events_hack[i].push(msg)
                        }
                    }) : isHac ? makeListRolesHacker(function(j){
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
        
        say(mp3lang("mutant-de-base-se-reveille"), function(){
            var div = $('<div class=info>')
            body.append(div)
            
            div.append(
                $('<div class=info>').text(lang("Bonjour mutant de base", "Hello base mutant"))
            ).append(
                events[i].length ? events[i].map(function(msg){
                    return $('<div class=info>').text(msg)
                }) : $('<div class=info>').text(lang("Rien ne s'est passé", "Nothing happened"))
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
        //     say(mp3lang('medecins-se-reveillent-pause-' + (1 + randrange(4))), next)
        // } else {
            say(mp3lang("medecins-se-reveillent"), function(){
                if(! anyAlive) {
                    setTimeout(next, 10000 + Math.random() * 10000) // allowed for mobile too
                    return;
                }
                
                var div = $('<div>')
                body.append(div)
                
                div.append(
                    $('<div>').text(lang('Bonjour médecins, que voulez vous faire ?', 'Hello doctors, what do you want to do?'))
                )
                .append(
                    $('<div class="item">').text(lang('Soigner', 'Heal')).click(function(){
                        div.empty()
                        var stillSoins = 0
                        var soins = []
                        for(var n = 1; n <= 2; n++){
                            var i = rolesSlug.indexOf("medecin-" + n)
                            if(alive[i] && ! events[i].length) {
                                stillSoins++
                                div.append(
                                    $('<div>').text(lang("Cible de soin", "Heal target"))
                                ).append(
                                    makeListJoueurs(function(j){
                                        soins.push(j)
                                        
                                        if(etats[j] == "Mutant") {
                                            if(genomes[j] == tr.hôte) {
                                                events[j].push("On a essayé de vous soigner mais ça n'a pas marché car vous êtes HÔTE")
                                            } else {
                                                events[j].push("Vous êtes soigné ! Vous êtes SAIN à nouveau !")
                                                etats[j] = tr.sain
                                            }
                                        } else {
                                            events[j].push("On a essayé de vous soigner mais vous êtes déjà sain...")
                                        }
                                        
                                        events_espion[j].push(lang("Soigné", "Healed"))
                                        
                                        if(--stillSoins == 0) {
                                            div.remove()
                                            var wait = $('<div class=info>')
                                            body.append(wait)
                                            wait.append(
                                                $('<div>').text(lang('Vos cibles de soin :', 'Your heal targets:'))
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
                    $('<div class="item">').text(lang('Tuer', 'Murder')).click(function(){
                        div.empty()
                        div.append($('<div>').text(lang("Cible de meutre", "Murder target"))).append(
                            makeListJoueurs(function(j){
                                alive[j] = false
                                events[j].push(lang("Vous êtes MORT", "You are DEAD"))
                                mortsAtNight.push(j)
                                
                                div.empty()
                                say(mp3lang("medecins-ont-tue"), function(){
                                    div.append(
                                        $('<div class=info>').append(
                                            $('<div>').text(lang('Mort de {} !', "{}'s death!").replace('{}', joueurs[j]))
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
                say(mp3lang("medecin-" + n + "-se-reveille"), function(){
                    var self;
                    body.append(
                        self = $('<div>').append(
                            $('<div>').text(lang("Bonjour Médecin #", "Hello Doctor #") + n + " " + joueurs[i])
                        ).append(
                            $('<div class=info>').text(
                                events[i].length ? [] : lang('Aucun événements cette nuit', 'No events tonight')
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
                                    lang("Vous ne vous réveillerez donc PAS avec votre autre médécin.", "You will then NOT wake up with the other doctor.") :
                                    lang("Vous vous réveillerez donc normalement", "You will then wake up normally")
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
            say(mp3lang("fin-de-partie-sains"), function(){})
            return
        } 
        if (getNumberOfSains() == 0) {
            say(mp3lang("fin-de-partie-mutants"), function(){})
            return
        }
        
        // say(mp3lang("tout-le-monde-s-endort"), function(){
        say(mp3lang("mutants-se-reveillent"), function(){
            var div = $('<div>');
            body.append(div)
            
            div.append(
                $('<div>').text(lang("Bonjour mutant(s), que voulez-vous faire ?", "Hello mutant(s), what do you want to do?"))
            ).append(
                $('<div class="item">').text(lang("Muter et Paralyser", "Mutation and Paralysis")).click(function(){
                    div.empty()
                    
                    var par = -1, mut = -1;
                    
                    function checkNext() {
                        if(par != -1 && mut != -1) {
                            // apply mutation
                            if(genomes[mut] != tr.résistant) {
                                events[mut].push(lang("Vous êtes maintenant MUTANT", "You are now MUTANT"))
                                etats[mut] = tr.mutant
                            } else {
                                events[mut].push(lang("On a essayé de vous muter mais cela n'a pas marché car vous êtes RÉSISTANT", "One tries to mutate you but it did not work because you are RESISTANT"))
                            }
                            // apply paralysis
                            events[par].push(tr.vous_etes_paralyse)
                            paralyses[par] = true
                            
                            // record mutation
                            events_espion[mut].push(tr.muté)
                            // record paralysis
                            events_espion[par].push(tr.paralysé)
                            
                            div.remove()
                            
                            var wait = $('<div class=info>').append(
                                $('<div>').text(lang('Vos actions :', "Your actions:"))
                            ).append(
                                $('<ul>').append(
                                    $('<li>').text(joueurs[mut] + ' ' + lang("est votre cible de mutation.", "is your mutation target."))
                                ).append(
                                    $('<li>').text(joueurs[par] + ' ' + lang("est paralysé", "is paralysed"))
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
                        $('<div>').text(lang('Cible de mutation :', "Mutation target:"))
                    ).append(
                        makeListJoueurs(function(m){
                            mut = m
                            checkNext()
                        })
                    ).append(
                        $('<div>').text(lang('Cible de paralysie :', 'Paralysis target:'))
                    ).append(
                        makeListJoueurs(function(p){
                            par = p
                            checkNext()
                        })
                    )
                })
            ).append(
                $('<div class="item">').text(lang("Tuer et Paralyser", "Murder and Paralysis")).click(function(){
                    div.empty()
                    
                    var par = -1, tue = -1;
                    
                    function checkNext() {
                        if(par != -1 && tue != -1) {
                            // apply death
                            alive[tue] = false
                            events[tue].push(lang("Vous êtes MORT", "You are DEAD"))
                            mortsAtNight.push(tue)
                            
                            // apply paralysis
                            events[par].push(tr.vous_etes_paralyse)
                            paralyses[par] = true
                            
                            // record paralysis
                            events_espion[par].push(tr.paralysé)
                            
                            div.remove()
                            
                            var wait = $('<div class=info>').append(
                                $('<div>').text(lang('Vos actions :', "Your actions:"))
                            ).append(
                                $('<ul>').append(
                                    $('<li>').text(joueurs[tue] + ' ' + lang("est tué", "is killed"))
                                ).append(
                                    $('<li>').text(joueurs[par] + ' ' + lang("is paralysed", "est paralysé"))
                                )
                            ).append(
                                $('<div class=ici>').text('Ok')
                            )
                            
                            body.append(wait)
                            
                            wait.click(function(){
                                wait.remove()
                                
                                say(mp3lang("mutants-ont-tue"), function(){
                                    var infodeath;
                                    body.append(
                                        infodeath = $('<div class=info>').append(
                                            $('<div>').text(lang("Mort de {} !", "{}'s death!").replace('{}',joueurs[tue]))
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
                        $('<div>').text(lang('Cible de meurtre :', 'Murder target:'))
                    ).append(
                        makeListJoueurs(function(m){
                            tue = m
                            checkNext()
                        })
                    ).append(
                        $('<div>').text(lang('Cible de paralysie :', 'Paralysis target:'))
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
                            say(mp3lang("mutants-ont-tue"), function(){
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
                $('<div>').text(lang("Choisissez un chef et puis GO !", "Choose a chief then GO!"))
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
                lang("Login pour informations :", "Login for informations")
            ).append(
                makeListJoueurs(function(i){
                    var self;
                    login.empty()
                    
                    if(! contains(still, i)) {
                        login.append(
                            self = $('<div class=info>').append(
                                $('<div>').text(lang("Vous êtes déjà venu !", "You already came!"))
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
                                $('<div>').text(lang("Bonjour", "Hello") + ' ' + joueurs[i])
                            ).append(
                                $('<div class=info>').text(lang("Vous êtes", "You are") + ' ' + roles[i])
                            )
                            .append(
                                ! startswith(rolesSlug[i], "medecin") ? [] :
                                $('<div class=info>').text(lang("Et l'autre médecin est", "And the other doctor is") + ' ' + joueurs.filter(function(name, j){
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
