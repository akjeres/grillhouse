(function(){
    if ( !(
        document.getElementById('bbq-form')
        && document.getElementById('galleryModal')
        )) return;

    window.addEventListener('load', function() {
        document.querySelector('.preloader').classList.remove('in');
        var form_id= 'bbq-form';
        var form = $('#' + form_id);
        var image_selector = '.page-photos_item';

        $(image_selector).on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            var target = $(e.target.closest(image_selector));
            var popup = $('#galleryModal');
            var img = popup.find('img');
            var ref_img = target.find('img');

            img.prop('src', ref_img.prop('src')).prop('alt', ref_img.prop('alt'));
            popup.modal('show');
        });

        form.on('submit', function(e) {
            e.preventDefault();
            form.find('input, select, textarea').removeClass('error');
            var name = form.find('[name=name]');
            var phone = form.find('[name=phone]');
            var amount = form.find('[name=amount]');
            var notif = form.parent().parent().find('.modal-message');
            var notif_title = notif.find('h4');
            var notif_message = notif.find('p');

            var nameFlag = validateName(amount);
            var phoneFlag = validatePhone(phone);

            if (!(
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
                },
                complete: function() {
                    setTimeout(function () {
                        form.parent().addClass('in').prev().removeClass('in');
                        notif_title.text('');
                        notif_message.text('');
                        $('button[data-target="#myModal"]').prop('disabled', false);
                        form[0].reset();
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
