import { StyleSheet, View, Image, Text } from "react-native";
import colors from "../../utils/colors";
import logo from "../../assets/jobLogo.png";

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <View>
                <Image source={logo} style={styles.image} />
                <Text style={styles.text}>JobLik</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.PRIMARY
    },
    image : {
        width: 120,
        height: 120,
        resizeMode: "cover",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center"
    },
    text: {
        fontSize: 40,
        fontWeight: "bold",
        color: colors.WHITE,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center"
    }
});