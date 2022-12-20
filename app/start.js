import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import * as path from 'node:path';
import * as os from 'os';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {readdir} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createWriteStream} from 'node:fs'

const arrArgv = process.argv
let name = '';
const homeDir = os.homedir();
let actualDir = '';

const sep = path.sep;


const args = () => {
    arrArgv.forEach((arg) => {
        if (arg.includes('=')) {
         name = arg.substring(arg.indexOf('=') + 1);
        }
    })
    actualDir = homeDir
    console.log(`Welcome to the File Manager, ${name}`)
    console.log(actualDir)

}
args();


const fileMethods = {
    cd:async (param) => {
        let prm = '';
        if (param[0][0] === `${sep}`) {
            prm = param[0].substring(1);
        }
       if (existsSync(`${actualDir}${sep}${prm}`)) {
         actualDir +=`${sep}${prm}`;
        } else {
           throw Error('Path not exist')
        }

    },
    ls: async () => {
        const arrFile = [];
        const arrDirectory = [];
        const files = await readdir(`${actualDir}`);
        for await (let file of files) {
            if ((await fs.lstat(`${actualDir}${sep}${file}`)).isDirectory()) {
                arrDirectory.push({name: file, value: 'Directory'})
            } else {
                arrFile.push({name: file, value: 'File'})
            }
        }
        arrDirectory.sort((a, b) => a.name > b.name ? 1 : -1)
        arrFile.sort((a, b) => a.name > b.name ? 1 : -1)


        console.table(arrDirectory.concat(arrFile))
    },
    up: async () => {
        if (actualDir === homeDir) {
            throw Error('You are in the root folder')
        } else {
            let dirs = actualDir.split(`${sep}`).slice(0, -1).join(`${sep}`);
            if (existsSync(dirs)) {
                actualDir = dirs
            }

        }
    },
    cat: async (param) => {
        if (existsSync(`${actualDir}${sep}${param[0]}`)) {
            const read = createReadStream(`${actualDir}${sep}${param[0]}`)
            read.pipe(output)
        } else {
            throw new Error('File not exit')
        }
    },
    add: async (param) => {
        if (existsSync(`${actualDir}${sep}${param[0]}`)) {
            throw new Error('File exist!')
        } else {

        }
    },
    rn: async (param) => {
        if (!existsSync(`${actualDir}${sep}${param[0]}`) || existsSync(`${actualDir}${sep}${param[1]}`)) {
            throw new Error('FS operation failed')
        }
        fs.rename(`${actualDir}${sep}${param[0]}`, `${actualDir}${sep}${param[1]}`);
    },
    cp:async (param) => {
        if (!existsSync(`${actualDir}${sep}${param[0]}`)) {
            throw new Error('FS operation failed')
        } else {
            const read = await createReadStream( `${actualDir}${sep}${param[0]}`);
            if (!existsSync(`${actualDir}${sep}${param[1]}`)) {
                await fs.writeFile(`${actualDir}${sep}${param[1]}`, ``);
            }
            const write = createWriteStream( `${actualDir}${sep}${param[1]}`)
            read.pipe(write)
        }

    }
}



const rl = readline.createInterface({ input, output });
rl.on('line', (input) => {

    let arrInp = input.split(' ');
    let command = arrInp[0];
   if (fileMethods[command]) {
       fileMethods[command](arrInp.slice(1))
           .then(res => {
                   console.log('Operation complete!')
                   console.log(actualDir)


           })
           .catch(er => console.log(er.message))
   } else {
       console.log('Invalid input')
   }





});

rl.on('close', () => {
    console.log(`Thank you for using File Manager, ${name}, goodbye!
`)
})
