import React from "react";
import {View, Text, TouchableOpacity, ActivityIndicator} from "react-native";

import {styles} from "./styles";
import {FontAwesome, FontAwesome5} from "@expo/vector-icons";

export const TerritoryCompanyItem = React.memo(
  ({item, onOpenTerritory, onOpenCountry}: any) => {
    const hasNoTerritory = (!item.departments || item.departments.length === 0) && 
                           (!item.countries || item.countries.length === 0);
    
    return (
    <View style={styles.row}>
      <Text style={[styles.cell, hasNoTerritory && {color: 'red'}]}>
        {item.name} {item.is_global ? "(Global)" : ""}
      </Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.LinkButton}
          onPress={() => onOpenTerritory(item)}
        >
          <FontAwesome5 name="map-marker-alt" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.greenLinkButton}
          onPress={() => onOpenCountry(item)}
        >
          <FontAwesome name="flag-checkered" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
    );
  }
);
