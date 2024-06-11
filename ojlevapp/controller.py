import os, re, shutil

def upcloud_img(path):
    filenames = os.listdir('./ojlevapp/static/img' + path)[-1]
    paths = re.split(r'[0-9]+', filenames)
    next_index = int(re.search(r'[0-9]+', filenames)[0]) + 1
    next_image = paths[0] + str(next_index) + paths[1]

    print("==>", "./ojlevapp/static/img/" + path + "/" + next_image)
    result = shutil.copyfile('./ojlevapp/static/img/upcloud.png', "./ojlevapp/static/img/" + path + "/" + next_image)
    return