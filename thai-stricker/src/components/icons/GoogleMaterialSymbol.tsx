import { MaterialIcons } from "@expo/vector-icons";
import { Text, type ColorValue } from "react-native";

type GoogleMaterialSymbolProps = {
  color: ColorValue;
  fallbackName: React.ComponentProps<typeof MaterialIcons>["name"];
  name: string;
  size: number;
};

export function GoogleMaterialSymbol({
  color,
  fallbackName,
  name,
  size,
}: GoogleMaterialSymbolProps) {
  if (typeof name !== "string" || name.length === 0) {
    return <MaterialIcons color={color} name={fallbackName} size={size} />;
  }

  return (
    <Text
      style={{
        color,
        fontFamily: "MaterialSymbols_400Regular",
        fontSize: size,
        includeFontPadding: false,
        lineHeight: size,
      }}
    >
      {name}
    </Text>
  );
}
