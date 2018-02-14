import glob
import itertools

filesToSkip = [
    'src/main.js'
]
files = [file for file in [file.replace('\\', '/') for file in itertools.chain(glob.iglob('src/*.js'), glob.iglob('src/**/*.js'))] if file not in filesToSkip]
scriptInput = ''
for file in files:
    scriptInput += '        <script src="' + file + '"></script>\n'
with open('index-template.html', 'r') as inFile:
    contents = inFile.read()
    contents = contents.replace('{{SCRIPTS}}', scriptInput)
    with open('index.html', 'w') as outFile:
        outFile.write(contents)