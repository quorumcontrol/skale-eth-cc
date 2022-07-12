import { Box, Button, Image, Text } from "@chakra-ui/react";
import React from "react";
import { InventoryItem } from "../hooks/useGameItems";
import ipfsToWeb from "../utils/ipfsToWeb";
import Video, { typeFromUrl } from "./Video";

const NFTCard: React.FC<{ item: InventoryItem, onChoose?:(tokenId:number) => any }> = ({
  onChoose, item: { tokenId, metadata: { name, description, image, animationUrl } },
}) => {
  return (
    <Box
      borderRadius="lg"
      borderWidth="1px"
      w="sm"
      h="md"
      overflow="hidden"
    >
      <Box h="70%" backgroundColor="#000">
        {typeFromUrl(animationUrl) ? (
          <Video animationUrl={animationUrl} controls autoPlay loop muted />
        ) : (
          <Image
            src={ipfsToWeb(image)}
            alt={`image of ${name}`}
            style={{
              minWidth: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              minHeight: "100%",
              objectFit: "contain",
            }}
          />
        )}
      </Box>
      <Box p="5" mb="5">
        <Text
          mt="4"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          noOfLines={1}
        >
          {name}
        </Text>
        <Text noOfLines={[2, 3, 5]} fontSize="sm">
          {description}
        </Text>
        {onChoose && (
          <Button onClick={() => onChoose(tokenId)}>Choose</Button>
        )}
      </Box>
    </Box>
  );
};

export default NFTCard;