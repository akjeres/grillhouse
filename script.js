(function(){
    window.addEventListener('load', function() {
        var form_id= 'bbq-form';
        var form = $('#' + form_id);

        form.on('submit', function(e) {
            e.preventDefault();
            form.find('input').removeClass('error');
            var name = form.find('[name=name]');
            var phone = form.find('[name=phone]');
            var message = form.find('[name=message]');
            var notif = form.parent().parent().find('.modal-message');
            var notif_title = notif.find('h4');
            var notif_message = notif.find('p');

            var nameFlag = validateName(name);
            var phoneFlag = validatePhone(phone);

            if (false  && !(
                    nameFlag && phoneFlag
                )) return;

            var data = new FormData(form.get(0));
            data.set('phone', phone.cleanVal());

            $.ajax({
                url: form.prop('action'),
                method: form.prop('method'),
                data: data,
                processData: false,
                contentType: false,
                success: function(data) {
                    var obj = null;
                    try {
                        obj = JSON.parse(data);
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (!obj) return;
                    notif_title.text(obj.title);
                    notif_message.text(obj.message);
                    if ('undefined' !== typeof dataLayer) { dataLayer.push({ event: form_id }) }
                    form.parent().removeClass('in').prev().addClass('in');
                    $('button[data-target="#myModal"]').prop('disabled', true);
                },
                error: function(data) {
                    var arr = [];
                    var result = [];
                    try {
                        arr = JSON.parse(data.responseText);
                        arr.forEach(function(i) {
                            if ('title' in i) {
                                notif_title.text(i.title);
                            } else {
                                result.push(i.message);
                            }
                        });

                        notif_message.text(result.join(', '));
                        form.parent().removeClass('in').prev().addClass('in');
                    } catch (e) {
                        console.error(e.message);
                    }
                    setTimeout(function () {
                        form.parent().addClass('in').prev().removeClass('in');
                        notif_title.text('');
                        notif_message.text('');
                    }, 3000);
                }
            });
        });
    });
    function validateName(input) {
        var value = input.val();
        if (!value) { input.addClass('error'); }
        return !!value;
    }
    function validatePhone(input) {
        var value = $(input).cleanVal();
        input.addClass('error');
        if (!!value
            && /^\d+$/i.test(value)
            && (value.toString().length === 10)
        ) {
            input.removeClass('error');
            return true;
        }
        return false;
    }
})();
