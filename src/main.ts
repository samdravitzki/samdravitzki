import './style.css'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>dravitzki.com</h1>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
