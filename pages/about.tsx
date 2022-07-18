import { Heading, Text, Box, VStack } from "@chakra-ui/react"
import AppLink from "../src/components/AppLink"
import Layout from "../src/layouts/Layout"
import PaddedQRCode from "../src/components/PaddedQRCode";

const About:React.FC = () => {
  return (
    <Layout>
      <Heading>Welcome to the #skaleverse</Heading>
      <Text>SKALE, Paper, Scissors is lovingly created by a group of product builders on the <AppLink href="https://skale.space/">SKALE network.</AppLink></Text>
      <Heading>Credits</Heading>
      <Text>Game design: Andrew Holz</Text>
      <Text>Coding: <AppLink href="https://github.com/thegreataxios">TheGreatAxios</AppLink> and <AppLink href="https://github.com/tobowers">Topper Bowers</AppLink></Text>
      <Text>Product, design, marketing support from:{" "}
        <AppLink href="https://ruby.exchange/">Ruby.exchange</AppLink>,{" "}
        <AppLink href="https://www.mylilius.com/">Mylilius</AppLink>,{" "}
        <AppLink href="https://larvamaiorum.com/">LarvaMaiorum</AppLink>,{" "}
        <AppLink href="https://skale.space/">SKALE.</AppLink></Text>
      <Text>3D Models:</Text>
      <VStack>
        <Text>Rock: <AppLink href="https://sketchfab.com/SaschaHenrichs">SasschaHenrichs</AppLink></Text>
        <Text>scissors: <AppLink href="https://sketchfab.com/tudor_macovei">tudor_macovei</AppLink></Text>
        <Text>Old Map: <AppLink href="https://sketchfab.com/Johana-PS">Johana-PS</AppLink></Text>
        <Text>Lizard: <AppLink href="https://sketchfab.com/DigitalLife3D">DigitalLife3D</AppLink></Text>
        <Text>Mirror: <AppLink href="https://sketchfab.com/AllyC3D">AllyC3D</AppLink></Text>
        <Text>Torch: <AppLink href="https://sketchfab.com/milacetious">milacetious</AppLink></Text>
        <Text>Pepper: <AppLink href="https://sketchfab.com/animator12">animator12</AppLink></Text>
        <Text>Polar Bear: <AppLink href="https://sketchfab.com/turunmuseokeskus">turunmuseokeskus</AppLink></Text>
      </VStack>
      <PaddedQRCode value={`${window.location.protocol}//${window.location.host}${window.location.port ? `:${window.location.port}` : ''}`} />
    </Layout>
  )
}

export default About
