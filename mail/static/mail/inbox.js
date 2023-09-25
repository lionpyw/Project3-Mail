document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-body').style.display = 'none';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  //sendMail
  document.getElementById('compose-form').onsubmit = send_mail;
}

function send_mail(){
  var recipients = document.querySelector('#compose-recipients').value;
  var subject = document.querySelector('#compose-subject').value;
  var body = document.querySelector('#compose-body').value;


  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    load_mailbox('sent');
    }).catch(error => {
      console.log('Error:', error);
      });
  
    return false;
}

  


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-body').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(emails =>{
              if (mailbox==='sent'){emails.forEach(add_div_sent)}
              else{
                emails.forEach(add_div);}
              console.log(emails);
      });


}



function add_div(content){
  const element = document.createElement('div');
    element.className = 'row';
  let status;
   if(!content.read){
      status=`<strong>${content.sender}</strong> `;
      element.style.backgroundColor= 'rgb(220,220,220)'}
  else{
     status=`${content.sender}`;}

  element.style.borderStyle='solid'; element.style.borderWidth= '1px';
  
    elementspan1= `<span class="col-md-2" style="word-wrap:break-word;">${status} </span>` ;
    elementspan2= `<span class="col-7">${content.subject} </span>` ;
    elementspan3= `<span class="col" 
    style="color: rgb(160, 157, 157); text-align:right;"> ${content.timestamp} </span>` ;
    element.innerHTML = elementspan1 + elementspan2 + elementspan3 ;
    // Add post to DOM
    document.querySelector('#emails-view').append(element);

    element.addEventListener('click', () => mail_body(`${content.id}`));
}

function add_div_sent(content){
  const element = document.createElement('div');
    element.className = 'row';
    element.style.borderStyle='solid'; element.style.borderWidth= '1px';
    elementspan1= `<span class="col-md-2" style="word-wrap:break-word;">${content.recipients} </span>`
    elementspan2= `<span class="col-7">${content.subject} </span>`
    elementspan3= `<span class="col" 
    style="color: rgb(160, 157, 157); text-align:right;"> ${content.timestamp} </span>`
    element.innerHTML = elementspan1 + elementspan2 + elementspan3;
    // Add post to DOM
    document.querySelector('#emails-view').append(element);
    element.addEventListener('click', () => mail_body(`${content.id}`));
}


function mail_body(content){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-body').style.display = 'block';

  console.log('This element has been clicked!')
                  fetch(`emails/${content}`)
                  .then(response => response.json())
                  .then(email => {  const data= email
                      // Print email
                      console.log(email);
                      read(email.id,true);
                      document.querySelector('#emails-body').innerHTML="";  
                      mail_detail(data);

                    });

}

function mail_detail(content){

  const archive = content.archived;
  let archi;
  if(content.archived)
  {archi = "Unarchive";}else{archi = "Archive";}
  const elementmb = document.createElement('div');
    elementmb.innerHTML =`
                          <div>
                          <strong>From:</strong> ${content.sender} <br>
                          <strong>To:</strong> ${content.recipients} <br>
                          <strong>Subject:</strong> ${content.subject} <br>
                          <strong>Timestamp:</strong> ${content.timestamp}  
                          <span id="rd" class="badge bg-primary"> Mark Unread</span>
                          <span id="arc" class="badge bg-warning">${archi}</span><br>
                          <button type="button" class="btn btn-sm btn-outline-primary" id="reply">
                          Reply
                          </button>
                          </div>
                          <hr />
                          <div>
                          ${content.body}
                          </div>
                          `;

    document.querySelector('#emails-body').append(elementmb);

    document.querySelector('#reply').addEventListener('click', () => 
                        reply_email(content.sender, content.subject, content.body, content.timestamp));

    document.querySelector('#rd').addEventListener('click', () => read(content.id, false));
    document.querySelector('#arc').addEventListener('click', () => archiver(content.id,!archive));



}

function reply_email(sender,subject,body,time) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-body').style.display = 'none';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = x;
  document.querySelector('#compose-subject').value = `Re: ${subject}`;
  document.querySelector('#compose-body').value = `On ${time} ${sender} wrote: 
  ${body}`;

  //sendMail
  document.getElementById('compose-form').onsubmit = send_mail;
}

function read(id,status){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: status
    })
  })
  if (status===false){alert(`Email marked unread`);
    load_mailbox('inbox');}
       
}
function archiver(id,status){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: status
    })
  })
  if (status===false){alert(`Email removed from Archive`);}else{alert(`Email added to Archive`);}
  load_mailbox('inbox');
}
