async function getUser(id) {
    let response = await fetch('/users/' + id, {
        method: 'GET'
    });
    let answer = await response.json();
    document.getElementById("user").innerHTML = answer['username'];
    let getCycle = await fetch('/cycles/' + answer['cycle'], {method: 'GET'});
    let cycle = await getCycle.json();
    document.getElementById("data").innerHTML = cycle['coinsCount'];
    document.getElementById("clickPower").innerHTML = cycle['clickPower'];
    let boost_request = await fetch('/boosts/' + answer.cycle, {method: 'GET'})
    let boosts = await boost_request.json()
    RenderAllBoosts(boosts)
    CheckBoostAviable()
    SetAutoClick()
    SetConisSender()
}

async function callClick() {
    let response = await fetch('/click/', {method: 'GET'});
    let answer = await response.json();
    document.getElementById("data").innerHTML = answer.coinsCount;
    if (answer.boosts) RenderAllBoosts(answer.boosts);
    CheckBoostAviable()
}

function BuyBoost(boost_level) {
    let boost_price;
    let coins = BigInt(document.getElementById('data').innerHTML)
    let boost = document.getElementById('boostPrice_' + boost_level)
    if (boost !== null)
        boost_price = BigInt(boost.innerHTML)
    else
        boost_price = 10
    if (coins >= boost_price) {
        const csrftoken = GetCookie('csrftoken')
        fetch('/buyBoost/', {
            method: 'POST',
            headers: {
                "X-CSRFToken": csrftoken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                boost_level: boost_level
            })
        }).then(response => {
            if (response.ok)
                return response.json()
            else
                return Promise.reject(response)
        }).then(data => {
            if (data['boost_type'] === 1) {
                document.getElementById('boostPower_' + data['level']).innerHTML = data['power'];
                document.getElementById('boostLevel_' + data['level']).innerHTML = data['level'];
                document.getElementById('boostPrice_' + data['level']).innerHTML = data['price'];
            } else
                document.getElementById("autoClickPower").innerHTML = data['autoClickPower'];
            document.getElementById("data").innerHTML = data['coinsCount'];
            document.getElementById("clickPower").innerHTML = data['clickPower'];
            CheckBoostAviable()
        })
    }
}

function CheckBoostAviable() {
    let coins = BigInt(document.getElementById('data').innerHTML)
    let boost = document.getElementById('boost-wrapper')
    for (const boostElement of boost.children) {
        let boostPrice = BigInt(boostElement.children[1].children[0].children[1].children[0].innerHTML)
        if (coins < boostPrice)
            boostElement.classList.add("disableboost")
        else
            boostElement.classList.remove("disableboost")
    }
}


function RenderAllBoosts(boosts) {
    let parent = document.getElementById('boost-wrapper')
    if (parent.children.length > 1)
        parent.innerHTML = ''
    boosts.forEach(boost => RenderBoost(parent, boost))
    if (parent.children.length > 1) {
        let b = document.getElementById('boost-holder')
        b.remove()
    }
}

function RenderBoost(parent, boost) {
    console.log(boost);
    const div = document.createElement('div')
    div.setAttribute('class', 'boost-holder')
    div.setAttribute('id', `boost-holder-${boost.level}`)
    if (boost.boost_type === 1) {
        div.innerHTML = `
                <div class="item-1">
                    <input id="buy_img" type="image" style="height: 145px; width: 150px; border-radius: 20px" src="https://c0.klipartz.com/pngpicture/189/62/gratis-png-rayo-mcqueen-mater-sally-carrera-mundo-de-los-coches-thumbnail.png"
                           "/>
                </div>
                <div class="item-2">
                    <div class="box-1">
                       <div>Сила буста
                            <div id="boostPower_${boost.level}">${boost.power}</div>
                       </div>
                        <div>Цена буста
                            <div id="boostPrice_${boost.level}">${boost.price}</div>
                       </div>
                    </div>
                    <div class="box-2">
                        <div>Уровень буста<div id="boostLevel_${boost.level}">${boost.level}</div></div>
                    </div>
                </div>
  `
    } else {
        div.innerHTML = `
                <div class="item-1">
                    <input id="buy_img" class="buy_img" type="image" style="height: 145px; width: 150px; border-radius: 20px;" src="https://w7.pngwing.com/pngs/33/809/png-transparent-lightning-mcqueen-lightning-mcqueen-cars-tongue-pixar-the-walt-disney-company-lightning-mcqueen-child-car-vehicle.png"
                           "/>
                </div>
                <div class="item-2">
                    <div class="box-1">
                       <div>
                            <div id="boostPower_${boost.level}">Автобуст</div>
                       </div>
                        <div>Цена буста
                            <div id="boostPrice_${boost.level}">${boost.price}</div>
                       </div>
                    </div>
                    <div class="box-2">
                        <div>Уровень буста<div id="boostLevel_${boost.level}">${boost.level}</div></div>
                    </div>
                </div>
  `
    }
    div.onclick = function () {
        BuyBoost(boost.level)
    }
    parent.appendChild(div)
}


function SetAutoClick() {
    setInterval(function () {
        const coins_counter = document.getElementById('data')
        let coins_value = BigInt(coins_counter.innerText)
        const auto_click_power = document.getElementById('autoClickPower').innerText
        coins_value += BigInt(auto_click_power)
        document.getElementById("data").innerHTML = coins_value;
    }, 1000)
}

function SetConisSender() {
    setInterval(function () {
        const csrftoken = GetCookie('csrftoken')
        const coins_counter = document.getElementById('data').innerText

        fetch('/set_maincycle/', {
            method: 'POST',
            headers: {
                "X-CSRFToken": csrftoken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coinsCount: coins_counter,
            })
        }).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                return Promise.reject(response)
            }
        }).then(data => {
            CheckBoostAviable()
        }).catch(err => console.log(err))
    }, 10000)
}

function GetCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}