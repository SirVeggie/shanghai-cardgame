import sys
import os

cwd = os.getcwd()

def main():
    if len(sys.argv) < 2:
        print("No args")
        return
    file = sys.argv[1]
    print("Creating file")

    scss = f'{cwd}/{file}.module.scss'
    tsx = f'{cwd}/{file}.tsx'

    print(scss)
    print(tsx)

    with open(scss, 'w') as f:
        f.write('@import "../shared";\n')
        f.write('\n')
        f.write('\n')
        f.close()

    with open(tsx, 'w') as f:
        f.write(f"import style from '{file}.module.scss'\n")
        f.write('\n')
        f.write(f'export const {file.capitalize()} = () => ')
        f.write('{\n')
        f.write(f'    return <div>{file}</div>\n')
        f.write('}\n')
        f.write('\n')
        f.close()
        



main()
