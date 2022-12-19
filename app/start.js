import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
// import * as path from 'node:path';
import * as os from 'os';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {readdir} from 'node:fs/promises'

const arrArgv = process.argv
let name = '';
const homeDir = os.homedir();
let actualDir = '';

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
    actD: actualDir,
    add: async (param)  => {
     await fs.writeFile(`${actualDir}/${param[0]}`, '');
    },
    cd:async (param) => {
       if (existsSync(`${actualDir}/${param[0]}`)) {
         actualDir +=`/${param}`;
        } else {
           throw Error('Path not exist')
        }

    },
    ls: async () => {
        const arr = []
        const files = await readdir(`${actualDir}`);
        for await (let file of files) {
            if ((await fs.lstat(`${actualDir}/${file}`)).isDirectory()) {
                arr.push({name: file, value: 'Directory'})
            } else {
                arr.push({name: file, value: 'File'})
            }


        }
        console.table(arr)
    },
    up: async () => {
        if (actualDir === homeDir) {
            throw Error('You are in the root folder')
        } else {
            let dirs = actualDir.split('/').slice(0, -1).join('/');
            if (existsSync(dirs)) {
                actualDir = dirs
            }

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
               if (res) {
                   console.log('Operation complete!')
                   console.log(actualDir)
               }

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
