
const addressExists = (addr?:string) => {
  return !!addr && (addr !== '0x')
}

export default addressExists
