const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message Element
    const $newMessage = $messages.lastElementChild

    // Height of the last message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight * newMessageMargin

    // Visible Height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have I scrooled?
    const scrollOffset = $messages.scrollTop + visibleHeight;


    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight 
    }

} 

socket.on('roomData',({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    // document.querySelector('#sidebar').innerHTML = html
    $sidebar.innerHTML = html
});

socket.on('message', (message) => {
   
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a') 
    });
    $messages.insertAdjacentHTML('beforeend', html)  
    autoscroll()
});

socket.on('locationMessage', (message) => {
  
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a') 
    });
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled');
   
    // const message = document.querySelector('input').value
    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
           return console.log('profanity is not allowed') 
        }

       console.log("Message Delivered")
    });
})

    $sendLocationButton.addEventListener('click', () => {
        if (!navigator.geolocation) {
            return alert("GeoLocation is not supported by the browser");
        }

        $sendLocationButton.setAttribute('disabled', 'disabled');

        navigator.geolocation.getCurrentPosition((position) => {
            console.log(position)
            socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
                $sendLocationButton.removeAttribute('disabled');
                console.log('Location Shared!')
            });
        });
    })

    socket.emit('join', { username, room }, (error) => {
         if (error) {
            alert(error)
            location.href = '/'
         } 
    });

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated', count) 
// });

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked');
//     socket.emit('increment');
// })