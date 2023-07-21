from flask import Flask, render_template, request, redirect, session
import json, paper_help

app = Flask(__name__)
app.secret_key = 'SR&o7jrYFj!ADU3!&!q&G^V$5Dzc*5%j'

data = []; questions = []; marks =[]; answers = []


@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method != 'POST':
        return render_template("login.html")
    else:
        if request.form['uname'] == 'admin' and request.form['pswd'] == "admin":
            session['un'] = request.form['uname']
            return redirect('/')
        else:
            return redirect('login')


@app.route('/')
def home():
    if 'un' in session:
        return redirect('test')
    else:
        return redirect('login')


@app.route('/test', methods=['POST', 'GET'])
def test():
    if request.method != 'POST' and 'un' in session:
        return render_template("paper.html")
    else:
        if 'un' in session:
            global data, questions, marks, answers
            paper = request.form['paper']
            data = paper_help.setup(paper)
            questions = paper_help.get_questions(data)
            marks = paper_help.get_marks(data)
            answers = paper_help.get_answers(data)
            return redirect('init')
        else:
            return redirect('login')


@app.route('/init')
def init():
    if 'un' in session:
        return render_template("img_input.html", q=len(questions))
    else:
        return redirect('login')


@app.route('/img_data', methods=['POST'])
def img_data():
    qn_list = []
    an_list = []
    if request.method == "POST" and 'un' in session:
        for i in range(1, len(questions)):
            v = 'off'
            try:
                v = request.form['c' + str(i)]
            except Exception:
                pass
            if v == 'on':
                q = request.form['a_' + str(i)]
                a1 = request.form['a_' + str(i) + "_1"]
                a2 = request.form['a_' + str(i) + "_2"]
                a3 = request.form['a_' + str(i) + "_3"]
                a4 = request.form['a_' + str(i) + "_4"]
                if q != '':
                    qn_list.append([i, q])
                if a1 != '':
                    an_list.append([i, a1, a2, a3, a4])
        qn_list = json.dumps(qn_list)
        an_list = json.dumps(an_list)

        return render_template("test.html", height=len(questions), ql=qn_list, al=an_list)


def match_key(key):
    if key == "JVB*8E5Zzst84W5cAH#Jp$HsqX5Qom79":
        return True
    print(key)
    return False


# apis
@app.route('/api/get_ques', methods=['POST'])
def get_ques():
    if request.method == 'POST' and match_key(request.form['key']):
        num = request.form['num']
        return json.dumps(questions[int(num)].split('\n'))


@app.route('/api/get_ques_count', methods=['POST'])
def get_ques_count():
    if request.method == 'POST' and match_key(request.form['key']):
        return json.dumps(len(questions) - 1)


@app.route('/api/get_marks', methods=['POST'])
def get_marks():
    if request.method == 'POST' and match_key(request.form['key']):
        return json.dumps(marks)


@app.route('/api/make_report', methods=['POST'])
def make_report():
    if request.method == 'POST' and 'un' in session:

        ans = request.form['ans_input'].split(',')
        ans_t = request.form['ans_t_input'].split(',')

        for i in range(1, len(ans_t)):
            if ans_t[i].isnumeric():
                if int(ans_t[i]) < 60:
                    ans_t[i] = "00:" + ans_t[i]
                else:
                    ans_t[i] = str(int(ans_t[i]) // 60) + ":" + str(int(ans_t[i]) % 60)

        res = []

        for i in range(1, len(answers)):
            #print(i, ans[i], answers[i])
            if ans[i].strip() == str(answers[i][0]).strip():
                res.append([i, True])
            else:
                res.append([i, False])

        sum = 0
        tot = 0
        for i in res:
            if i[1]:
                sum += marks[i[0]]
            else:
                if answers[i[0]][1]:
                    if marks[i[0]] == 1:
                        sum -= 1/3
                    else:
                        sum -= 2/3
            tot += marks[i[0]]
        sum = sum / tot * 100

        return render_template("rpt.html", res=res, data=data, ans=ans,
                               time=ans_t, ans2=answers, m=marks, per=int(sum))


if __name__ == "__main__":
    app.run(host='localhost', port=80, debug=True)
