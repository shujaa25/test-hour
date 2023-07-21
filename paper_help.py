def setup(text):
    data = []
    t = ''
    for line in text.split('\n'):
        if line.find('Question:') > -1 or line.find('Report') > -1:
            data.append(t)
            t = line + '\n'
        else:
            t += line + '\n'
    return data


def get_questions(data):
    q = []
    for item in data:
        element = item.split('\r\n')
        t = ''
        for line in element:
            if line.find('Not Attempt') > -1:
                break
            else:
                t += line + '\n'
        q.append(t)
    return q


def get_answers(data):
    a = ['']
    for item in data:
        element = item.split('\n')
        for line in element:
            if line.find('Correct Answer') > -1:
                is_neg = False
                l = line.split(':')[1].strip()
                if l.isnumeric():
                    l = int(l)
                else:
                    if l.find("Option") > -1:
                        is_neg = True
                        l = l.split(',')
                        if len(l) == 1:
                            l = l[0]
                            l = int(l[len(l) - 1])
                        else:
                            x = ''
                            for k in l:
                                x += k[len(k) - 1] +' '
                            l = x
                a.append([l, is_neg])
    return a


def get_marks(data):
    m = [0]
    for item in data:
        for line in item.split('\n'):
            if line.find("Max Marks") > -1:
                m.append(int((line.split(':')[1]).strip()[0]))
                break
    return m

