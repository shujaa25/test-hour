//timer for tracking minutes for each qn.
t2 = setInterval(function(){
    try{
        if(ans_t[cq] == null)
            ans_t[cq] = 0;
        ans_t[cq]++;
    }catch(err){}
}, 1000);
//countdown timer for the entire test
function startTimer(duration, display) {
    var start = Date.now(),
        diff,
        minutes,
        seconds;
    var timer = setInterval(function() {
        diff = duration - (((Date.now() - start) / 1000) | 0);

        minutes = (diff / 60) | 0;
        seconds = (diff % 60) | 0;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (diff <= 0) {
            clearInterval(timer);
            end();
            }
    }, 1000);
}
var imgQ, imgA;
function start(){
    document.getElementById("startBtn").remove();
    document.getElementById("endBtn").style.display = 'inline';
    document.getElementById("lpt").style.display = 'block';
    document.getElementById("rpt").style.display = 'block';
    document.getElementById("bottom-bar").style.display = 'block';


    imgQ = JSON.parse(document.getElementById('img_list_q').value);
    imgA = JSON.parse(document.getElementById('img_list_a').value);

    get_marks();
    load_ques_count();

    var time_input = document.getElementById("time_input");
    time_input.disabled = true;

    var minutes = 60 * time_input.value,
        display = document.querySelector('#time');
    startTimer(minutes, display);

}

var ct = 0;
var ans;
var ans_t;
var marked;
function load_ques_count(){
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        ct = JSON.parse(this.responseText);

        ans = new Array(ct+1);
        ans_t = new Array(ct+1);
        marked = new Array(ct+1);

        load_question(1);
    }
    xhttp.open("POST", "/api/get_ques_count");
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("key=JVB*8E5Zzst84W5cAH#Jp$HsqX5Qom79");
}
var marks;
function get_marks(){
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        marks = JSON.parse(this.responseText);
    }
    xhttp.open("POST", "/api/get_marks");
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("key=JVB*8E5Zzst84W5cAH#Jp$HsqX5Qom79");
}

var cq = 1;
var MSQs = Array();
function load_question(num){

    document.getElementById("btn"+cq).classList.remove("btn-dark");
    if(ans_t[cq] != null && ans[cq] != null){
            document.getElementById("btn"+cq).classList.add("btn-success");
            document.getElementById("btn"+cq).classList.remove("btn-danger");

        }else if(marked[cq] == null)
            document.getElementById("btn"+cq).classList.add("btn-danger");


    if(num > ct || num < 1){
        num = ct;
    }

    cq = num;

    document.getElementById("btn"+cq).classList.add("btn-dark");

    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        content = JSON.parse(this.responseText);
        var title = document.getElementById('title');
        var question = document.getElementById('question');
        var options = document.getElementById('options');
        options.innerHTML = "";

        title.innerHTML = content[0];

        var qn = "";
        var code = "";
        var nat = true;
        var is_code = false;
        var is_msq = false;
        for(var i=1;i<content.length; i++){
            if(content[i] != "1."){

                if(content[i].indexOf('[MSQ]')>-1){
                    is_msq=true;
                    if(!MSQs.includes(cq)) MSQs.push(cq);
                }

                if(content[i] == "code"){
                    is_code = true;
                    continue;
                }

                if(is_code)
                    code+=content[i] + '<br>';
                else
                    qn += content[i] + '<br>';
            }else{
                nat = false;
                break;
            }
        }


        var imflag = -1;
        for(j=0;j<imgA.length && !nat;j++){
            if(cq == imgA[j][0]){
                imflag = j;
                break;
            }
        }


        for(var j =0; j <4 && !nat; j++){
            var li = document.createElement("li");

            var radio = document.createElement("input");
            if(is_msq){
                radio.type = 'checkbox';
                radio.setAttribute("onclick","check_copy()");
            }
            else radio.type = 'radio';
            radio.value = j+1;
            radio.name = 'radio';




            li.appendChild(radio);



            if(imflag != -1){
                var image = document.createElement('img');
                image.src = imgA[imflag][j+1];
                li.appendChild(image);
            }else{
                li.appendChild(document.createTextNode(" " + content[i+1]));
            }

            options.appendChild(li);
            i+=2;
        }

        //image
        const im = document.getElementById("im");
        for(var j =0; j<imgQ.length; j++){
            if(cq == imgQ[j][0]){
                im.style.display = 'block';
                im.src = imgQ[j][1];
                break;
            }else{
                im.style.display = 'none';
            }
        }

        question.innerHTML = qn;
        document.getElementById('code_holder').innerHTML = code;
        document.getElementById('mark').innerHTML = "Marks: "+marks[cq];

        var nat_input = document.getElementById('nat');
        if(nat){
            nat_input.style.display = 'block';
            nat_input.value = '';
        }else{
            nat_input.style.display = 'none';
        }

        //marking selected
        if(ans[cq] != null){
            if(!nat && !is_msq)
                document.getElementsByName('radio')[ans[cq]-1].checked = true;
            else if(nat && !is_msq)
                nat_input.value = ans[cq];
            else if(!nat && is_msq){
                nat_input.value = ans[cq];
                var ar = ans[cq].split(' ');
                for(var k = 0; k<ar.length; k++){
                    document.getElementsByName('radio')[ar[k]-1].checked = true;
                }
            }
        }

        //last question button
        if(cq == ct){
            document.getElementById("btnNext").innerHTML = "Save";
        }else{
            document.getElementById("btnNext").innerHTML = "Save & Next";
        }

        }
    xhttp.open("POST", "/api/get_ques");
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("key=JVB*8E5Zzst84W5cAH#Jp$HsqX5Qom79&num="+num);
}

function check_copy(){
    var nat_input = document.getElementById('nat');
    nat_input.value = '';
    var radios = document.getElementsByName('radio');
    for(var i = 0; i < radios.length; i++){
        if(radios[i].checked){
            nat_input.value += (i+1) + " ";
        }
    }
}
function next(){
    var radios = document.getElementsByName('radio');
    if(radios.length == 0 || MSQs.includes(cq)){
        var nat_input = document.getElementById('nat');
        if(nat_input.value != '')
            ans[cq] = nat.value;
        nat_input.value = '';
    }else{
        var radio = null;
    for(var i = 0; i < radios.length; i++){
        if(radios[i].checked){
            radio = radios[i].value;
        }
    }

    document.getElementById("btn"+cq).classList.remove("btn-secondary");

    if(radio != null)
            ans[cq] = radio;
    }

    load_question(cq+1);
}
function prev(){
    load_question(cq-1);
}

function end(){
    r = confirm("Are you sure?");
    if(r){
        document.getElementById('ans_input').value = ans;
        document.getElementById('ans_t_input').value = ans_t;
        document.getElementById('frm').submit();
    }

}

function clear_res(){
    var radios = document.getElementsByName('radio');
    ans[cq] = null;
    if(radios.length == 0 || MSQs.includes(cq)){
        var nat_input = document.getElementById('nat');
        nat_input.value = '';
    }else{
        for(var i = 0; i < radios.length; i++){
            radios[i].checked = false;
        }
    }
}

function mark(){
    if(marked[cq] == null){
        marked[cq] = true;
        document.getElementById("btn"+cq).classList.remove("btn-dark");
        document.getElementById("btn"+cq).classList.remove("btn-danger");
        document.getElementById("btn"+cq).classList.remove("btn-success");
        document.getElementById("btn"+cq).classList.add("btn-info");
    }else{
        marked[cq] = null;
        document.getElementById("btn"+cq).classList.remove("btn-info");
    }
}