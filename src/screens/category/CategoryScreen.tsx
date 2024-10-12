import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Container } from '../../components';
import { Status } from 'iconsax-react-native';
import { appColors } from '../../constants';

const CategoryScreen = () => {
    return (
        <Container back title='Quản lý danh muc'>
            <StatusBar barStyle='dark-content' backgroundColor={appColors.white} />
            <View>

            </View>

        </Container>
            
    );
}
const styles = StyleSheet.create({

})

export default CategoryScreen;
