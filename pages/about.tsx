import { Heading, Text } from "@chakra-ui/react"
import AppLink from "../src/components/AppLink"
import Layout from "../src/layouts/Layout"

const About:React.FC = () => {
  return (
    <Layout>
      <Heading>Welcome to the #skaleverse</Heading>
      <Text>Skale, Paper, Scissors is lovingly created by a group of product builders on the SKALE network.</Text>
      {/* TODO: write up on the game? */}
      <Heading>Credits</Heading>
      <Text>Coding: <AppLink href="https://github.com/thegreataxios">TheGreatAxios</AppLink> and <AppLink href="https://github.com/tobowers">Topper Bowers</AppLink></Text>
      {/* TODO: links here*/}
      <Text>Product, design, marketing support from: Ruby.exchange, Mylilius, LarvaMaiorum, SKALE.</Text>
      <Text>3D Models: {/* TODO: drop in the 3d credits here*/}</Text>
    </Layout>
  )
}

export default About
