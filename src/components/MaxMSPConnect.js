// src/components/MaxMSPConnect.js
import React, { useState, useEffect, useRef } from 'react';
import PubNub from 'pubnub';
import PropTypes from 'prop-types';

// Component for handling PubNub communication with Max/MSP
const MaxMSPConnect = ({ 
  pubKey, 
  subKey, 
  channel = 'max-web-channel',
  onMessageReceived
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const pubnubRef = useRef(null);
  
  // Initialize PubNub connection
  useEffect(() => {
    if (!pubKey || !subKey) {
      console.error('PubNub keys are required');
      return;
    }
    
    // Create PubNub instance
    pubnubRef.current = new PubNub({
      publishKey: pubKey,
      subscribeKey: subKey,
      uuid: 'react-app-' + new Date().getTime()
    });
    
    // Set up listener for incoming messages
    pubnubRef.current.addListener({
      status: (status) => {
        if (status.category === 'PNConnectedCategory') {
          setIsConnected(true);
          console.log('Connected to PubNub');
        }
      },
      message: (messageEvent) => {
        const msg = messageEvent.message;
        setReceivedMessages(prev => [...prev, msg]);
        
        // Call the callback if provided
        if (onMessageReceived) {
          onMessageReceived(msg);
        }
      }
    });
    
    // Subscribe to the channel
    pubnubRef.current.subscribe({ 
      channels: [channel]
    });
    
    // Cleanup on unmount
    return () => {
      if (pubnubRef.current) {
        pubnubRef.current.unsubscribe({
          channels: [channel]
        });
        pubnubRef.current.removeAllListeners();
      }
    };
  }, [pubKey, subKey, channel, onMessageReceived]);
  
  // Function to publish a message to Max/MSP
  const sendToMax = (data) => {
    if (!pubnubRef.current || !isConnected) {
      console.error('PubNub not connected');
      return;
    }
    
    pubnubRef.current.publish({
      channel: channel,
      message: data
    })
    .then(() => {
      console.log('Message sent to Max/MSP:', data);
    })
    .catch((error) => {
      console.error('Failed to send message to Max/MSP:', error);
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendToMax(message);
      setMessage('');
    }
  };
  
  return (
    <div className="max-msp-connect">
      <div className="connection-status">
        Status: {isConnected ? 'Connected to PubNub' : 'Disconnected'}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message for Max/MSP"
        />
        <button type="submit" disabled={!isConnected}>Send</button>
      </form>
      
      <div className="received-messages">
        <h3>Messages from Max/MSP:</h3>
        <ul>
          {receivedMessages.map((msg, index) => (
            <li key={index}>{JSON.stringify(msg)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Add prop type validation
MaxMSPConnect.propTypes = {
  pubKey: PropTypes.string.isRequired,
  subKey: PropTypes.string.isRequired,
  channel: PropTypes.string,
  onMessageReceived: PropTypes.func
};

export default MaxMSPConnect;