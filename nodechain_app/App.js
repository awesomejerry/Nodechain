/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import {
  AsyncStorage,
  Platform,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native'
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate
} from 'react-native-webrtc'
import socketIO from 'socket.io-client'
import Nodechain from '../src/index'
import { generate } from '../src/key'

type Props = {}
export default class App extends Component<Props> {
  state = {
    status: 'not connected',
    number: 0
  }
  nodechain = null
  async componentDidMount() {
    let keys = null
    keys = await AsyncStorage.getItem('keys')
    if (keys) {
      keys = JSON.parse(keys)
    } else {
      keys = generate()
      await AsyncStorage.setItem('keys', JSON.stringify(keys))
    }
    this.nodechain = new Nodechain({
      signaling: 'http://192.168.50.12:8888',
      socketIO,
      RTCPeerConnection,
      RTCSessionDescription,
      RTCIceCandidate,
      keys
    })
  }
  componentWillUnmount() {
    this.handleDisconnect()
  }
  handleConnect = async () => {
    this.handleDisconnect()
    this.nodechain.connect('my room').then(() => {
      this.setState(() => ({ status: 'connected' }))
    })
  }
  handleDisconnect = () => {
    if (this.nodechain) {
      this.nodechain.disconnect()
    }
  }
  handleShow = () => {
    this.setState(() => ({ number: this.nodechain.chain.length }))
    console.log(this.nodechain.chain)
  }
  handleAddNode = () => {
    this.nodechain.addNewNode({ foo: 'bar' })
  }
  render() {
    const { status, number } = this.state
    return (
      <View style={styles.container}>
        <Text>{status}</Text>
        <Text>{number}</Text>
        <Button title="Connect" onPress={this.handleConnect} />
        <Button title="Show" onPress={this.handleShow} />
        <Button title="Add" onPress={this.handleAddNode} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  }
})
