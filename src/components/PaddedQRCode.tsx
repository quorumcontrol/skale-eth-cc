import { Box } from '@chakra-ui/react'
import QRCode, { QRCodeProps } from "react-qr-code";


const PaddedQRCode:React.FC<QRCodeProps> = (props) => {
  return (
    <Box backgroundColor="white" p="16px">
      <QRCode value={props.value} />
    </Box>
  )
}

export default PaddedQRCode