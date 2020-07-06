const canvas = $("#canvas")[0];
const ctx = canvas.getContext('2d');
const board = $("#board_image")[0];
canvas.style.height = canvas.style.width;
canvas.height = canvas.width = 1000;
let theta = 0, omega = 0, alpha = -0.3, delta_t = 0.02, status = 0, interval = null, repeated = false, result = 0;
const button = $("#button-draw")[0];
const back_threshold = -Math.PI / 3
canvas.fillStyle = "rgb(206,119,84)"
const names = ["手链", "猫爪钥匙扣", "手帐", "谢谢惠顾", "香水", "唇膏", "月球灯"];
const img_name = ["bracelet", "key", "agenda", "", "perfume", "lipstick", "lamp"];

function update() {
    if (status === 2) {
        theta += omega * delta_t;
        omega += alpha * delta_t;
        if (omega < 0) {
            clearInterval(interval);
            postprocess();
            return;
        }
    } else if (status === 1) {
        theta += omega * delta_t;
        if (theta < back_threshold)
            theta = back_threshold + Math.random() / 10
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(theta)
    ctx.drawImage(board, -500, -500, canvas.width, canvas.height);
    ctx.restore();
    const path = new Path2D();
    path.moveTo(canvas.width * 0.47, 0)
    path.lineTo(canvas.width * 0.495, canvas.height * 0.1)
    path.lineTo(canvas.width * 0.53, 0)
    path.lineTo(canvas.width * 0.47, 0)
    ctx.fill(path)
}

function reset() {
    status = theta = omega = 0;
    $("#button-draw").addClass("btn btn-block btn-danger").removeClass("disabled btn-success").removeAttr("disabled")
    update();
}

reset();
button.onmousedown = function () {
    if (status !== 0)
        return;
    status = 1;
    omega = -0.5;
    interval = setInterval(update, delta_t * 1000)
    button.classList.remove('btn-danger')
    button.classList.add("btn-success")
}
button.onmouseup = function () {
    if (status !== 1)
        return
    status = 2;
    omega = theta * -10 + Math.random() * 5;
    $("#button-draw").attr("disabled", "")
}

function check_item() {
    theta = theta * 180 / Math.PI;
    theta %= 360;
    if (theta < 0) {
        theta += 360;
    }
    let id = Math.floor(theta / 60);
    if (theta > 183)
        id += 1;
    return {
        id: id,
        name: names[id],
        img_name: img_name[id]
    }
}

function postprocess() {
    let item = check_item();
    if (item.id === 3) {
        if (repeated) {
            $("#dialog-content").text("emmmmm.....我应该把的謝意送给谁呢?")
            $("#dialog-title").text("抽到了\"Thank you\"!")
            $("#dialog-normal").modal({
                backdrop: 'static',
                keyboard: false
            })
            return;
        }
        $("#dialog-thankyou").modal('show');
        return
    }
    $("#dialog-content").text("emmmmm.....我应该把这" + item.name + "送给谁呢?")
    $("#dialog-normal").modal({
        backdrop: 'static',
        keyboard: false
    })
    result = item.id;
}

function confirm() {
    let name = $("#name-input")[0].value;
    $("#name-confirm").removeClass("btn-primary").addClass("btn-secondary").attr("disabled","").text("请稍后....")
    fetch("https://b1dca5512b98ce4f6a6cd2a9ad9c34fa.m.pipedream.net", {
        method: "POST",
        // mode: "no-cors",
        body: JSON.stringify({
            name: name,
            id: result
        })
    }).then((response=>response.json())).then(data=>console.log(data));
}

$("#dialog-thankyou").on("hidden.bs.modal", function () {
    if (!repeated)
        reset();
    repeated = true;
})