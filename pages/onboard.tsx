import { Spinner, Text } from "@chakra-ui/react"
import { useRouter } from "next/router";
import { useCallback, useState } from "react"
import { OnResultFunction, QrReader } from "react-qr-reader";
import { useCanOnboard, useDoOnboard } from "../src/hooks/useGameItems"
import useIsClientSide from "../src/hooks/useIsClientSide"
import Layout from "../src/layouts/Layout"

const Onboard:React.FC = () => {
  const [loading,setLoading] = useState(false)
  const isClient = useIsClientSide()
  const canOnboard = useCanOnboard()
  const doOnboard = useDoOnboard()
  const router = useRouter()

  const onResult:OnResultFunction = useCallback((() => {
    let locked = false

    return async (result) => {
      if (!result || locked) {
        return
      }
      try {
        locked = true
        setLoading(true)
        await doOnboard.mutateAsync(result.getText())
        await router.push('/')
      } catch (err) {
        console.error('error with scan', err)
        locked = false
        setLoading(false)
      }

    }
  })(), [loading])

  if (!isClient || !canOnboard || loading) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    )
  }

  return (
    <Layout>
       <Text>Scan the new player&apos;s QR code.</Text>
      {isClient && (
        <QrReader
          containerStyle={{ width: "100%", height: "100%" }}
          constraints={{
            facingMode: "environment",
          }}
          onResult={onResult}
        />
      )}
    </Layout>
  )

}

export default Onboard